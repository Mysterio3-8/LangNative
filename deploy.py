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

STATIC_URL_VERCEL = "https://langnative.vercel.app"
STATIC_URL_RU = "https://mysterio3-8.github.io/LangNative/"
ADMIN_URL_RU = "https://mysterio3-8.github.io/LangNative/admin.html"
ADMIN_URL_VERCEL = "https://langnative.vercel.app/admin"
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
    print("🎉 СИНХРОНИЗАЦИЯ И АВТОДЕПЛОЙ ВЫПОЛНЕНЫ УСПЕШНО!")
    print("=" * 65)
    print("🇷🇺 Доступно в РФ без VPN (GitHub Pages):")
    print(f"   🌐 Сайт:     {STATIC_URL_RU}")
    print(f"   🛡️ Админка:  {ADMIN_URL_RU}")
    print("\n🌍 Зеркало Vercel (Глобальный CDN):")
    print(f"   🌐 Сайт:     {STATIC_URL_VERCEL}")
    print(f"   🛡️ Админка:  {ADMIN_URL_VERCEL}")
    print("=" * 65)
    print("GitHub Pages и Vercel автоматически обновляют сайт за 10–15 секунд при каждом запуске.\n")


if __name__ == "__main__":
    main()
