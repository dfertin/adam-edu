import re

EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str) -> str:
    email = normalize_email(email)
    if not email:
        raise ValueError("Введите email")
    if email.count("@") != 1:
        raise ValueError("Email должен быть в формате name@domain.com")
    local, domain = email.split("@")
    if not local:
        raise ValueError("Укажите имя перед @")
    if not domain or "." not in domain:
        raise ValueError("Укажите домен после @")
    if domain.endswith("."):
        raise ValueError("Домен не должен заканчиваться точкой")
    if not EMAIL_PATTERN.match(email):
        raise ValueError("Неверный формат email")
    return email
