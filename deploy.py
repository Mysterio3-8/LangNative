#!/usr/bin/env python3
"""
NATIVE Edu — 1-Click Auto-Deployer to GitHub & Vercel
Автоматически фиксирует любые изменения, делает git commit и отправляет на GitHub,
что моментально активирует автодеплой на постоянный статический домен Vercel.
"""

import sys
import subprocess
from datetime import datetime
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent

STATIC_URL = "https://langnative.vercel.app"
ADMIN_URL = "https://langnative.vercel.app/admin"
GITHUB_REPO = "https://github.com/Mysterio3-8/LangNative"


def run_cmd(cmd: list[str]) -> str:
    res = subprocess.run(cmd, cwd=SITE_DIR, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        print(f"❌ Ошибка выполнения {' '.join(cmd)}:\n{res.stderr}")
        sys.exit(res.returncode)
    return res.stdout.strip()


def main():
    print("=" * 65)
    print("🚀 NATIVE Edu: Запуск автодеплоя в GitHub и Vercel")
    print("=" * 65)

    # 1. Проверяем статус Git
    status = run_cmd(["git", "status", "--porcelain"])
    if not status:
        print("✅ Нет новых изменений для отправки. Репозиторий уже синхронизирован!")
    else:
        print("📦 Обнаружены новые изменения. Подготовка коммита...")
        run_cmd(["git", "add", "."])

        commit_msg = sys.argv[1] if len(sys.argv) > 1 else f"update: {datetime.now().strftime('%d.%m.%Y %H:%M')}"
        run_cmd(["git", "commit", "-m", commit_msg])
        print(f"✅ Коммит создан: «{commit_msg}»")

        print("📡 Отправка изменений в ветку main на GitHub...")
        run_cmd(["git", "push", "origin", "main"])
        print("✅ Успешно отправлено на GitHub!")

    print("\n" + "=" * 65)
    print("🎉 ВЕРСЕЛЬ АВТОДЕПЛОЙ АКТИВИРОВАН!")
    print("=" * 65)
    print(f"🌐 Постоянная статичная ссылка на сайт:   {STATIC_URL}")
    print(f"🛡️ Ссылка на панель администратора:     {ADMIN_URL}")
    print(f"📦 Исходный код на GitHub:              {GITHUB_REPO}")
    print("=" * 65)
    print("Vercel автоматически собирает и публикует сайт за 10–15 секунд при каждом запуске этого скрипта.\n")


if __name__ == "__main__":
    main()
