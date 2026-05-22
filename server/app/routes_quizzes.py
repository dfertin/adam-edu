from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .deps import get_current_user
from .models import Enrollment, Question, QuestionOption, Quiz, QuizAttempt, User
from .schemas import QuizOut, QuizResultOut, QuizSubmit
from .services.progress_service import recalculate_course_progress

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("/lesson/{lesson_id}", response_model=QuizOut)
def get_quiz(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = (
        db.query(Quiz)
        .options(joinedload(Quiz.questions).joinedload(Question.options))
        .filter(Quiz.lesson_id == lesson_id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Тест не найден")

    lesson = quiz.lesson
    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    if not enr and not lesson.is_free_preview:
        raise HTTPException(status_code=403, detail="Нет доступа")

    from .schemas import QuestionOptionOut, QuestionOut

    questions = []
    for q in quiz.questions:
        questions.append(
            QuestionOut(
                id=q.id,
                text=q.text,
                options=[QuestionOptionOut(id=o.id, text=o.text) for o in q.options],
            )
        )
    return QuizOut(id=quiz.id, title=quiz.title, passing_score=quiz.passing_score, questions=questions)


@router.post("/{quiz_id}/submit", response_model=QuizResultOut)
def submit_quiz(
    quiz_id: int,
    payload: QuizSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = (
        db.query(Quiz)
        .options(joinedload(Quiz.questions).joinedload(Question.options))
        .filter(Quiz.id == quiz_id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Тест не найден")

    total = len(quiz.questions)
    correct = 0
    for question in quiz.questions:
        selected_id = payload.answers.get(question.id)
        if not selected_id:
            continue
        option = db.query(QuestionOption).filter(QuestionOption.id == selected_id).first()
        if option and option.is_correct:
            correct += 1

    score = round((correct / total) * 100) if total else 0
    passed = score >= quiz.passing_score

    attempt = QuizAttempt(user_id=current_user.id, quiz_id=quiz.id, score=score, passed=passed)
    db.add(attempt)
    db.commit()

    if passed:
        from datetime import datetime
        from .models import LessonProgress

        prog = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == quiz.lesson_id)
            .first()
        )
        if not prog:
            prog = LessonProgress(user_id=current_user.id, lesson_id=quiz.lesson_id)
            db.add(prog)
        prog.completed = True
        prog.completed_at = datetime.utcnow()
        prog.watch_percent = 100.0
        db.commit()
        recalculate_course_progress(db, current_user.id, quiz.lesson.course_id)

    return QuizResultOut(score=score, passed=passed, correct_count=correct, total_count=total)
