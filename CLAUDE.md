# PyLadies Courseware

## Přehled projektu

PyLadies Courseware je webová aplikace pro odevzdávání a review domácích úkolů z kurzů programování PyLadies. Aplikace umožňuje studentům odevzdávat řešení úkolů a koučům poskytovat zpětnou vazbu.

**Produkční nasazení**: https://projekty.pyladies.cz/
**Demo (resetováno při každém deploy)**: https://projekty-demo.messa.cz/

## Architektura

Aplikace používá moderní architekturu s odděleným frontendem a backendem:

```
browser --> nginx
              ├─ /* ------------> Node.js frontend (React/Next.js)
              └─ /api, /auth ---> Python backend (aiohttp) ---> MongoDB
```

### Frontend

- **Framework**: React s Next.js
- **Port**: 3000
- **Hlavní závislosti**:
  - React 16.14
  - Next.js 9.5.5
  - Semantic UI React
  - CodeMirror pro editor kódu
  - React Diff Viewer pro zobrazení rozdílů

### Backend

- **Framework**: Python 3.6+ s aiohttp
- **Port**: 5000
- **Databáze**: MongoDB (port 27017)
- **Hlavní závislosti**:
  - aiohttp s async/await
  - motor (asyncio MongoDB driver)
  - bcrypt pro hashování hesel
  - markdown s bleach pro bezpečné renderování
  - PyYAML pro načítání dat kurzů

## Struktura projektu

```
pyladies-courseware/
├── frontend/               # React/Next.js frontend
│   ├── components/        # React komponenty
│   ├── pages/            # Next.js stránky (routing)
│   ├── static/           # Statické soubory
│   └── util/             # Pomocné funkce
├── backend/               # Python aiohttp backend
│   ├── cw_backend/       # Hlavní aplikace
│   │   ├── courses/      # Správa kurzů a lekcí
│   │   ├── model/        # Datové modely (MongoDB)
│   │   ├── views/        # API endpointy
│   │   └── util/         # Pomocné funkce
│   └── tests/            # Testy
├── data/                  # Data kurzů (YAML soubory)
│   ├── courses.yaml      # Seznam všech kurzů
│   ├── 2024_pyladies_praha_autumn/  # Adresář kurzu
│   │   ├── course.yaml              # Definice kurzu
│   │   └── tasks/                   # Úkoly
│   │       ├── 01_prvni_program.yaml
│   │       ├── 02_promenne_podminky.yaml
│   │       └── ...
│   └── ...                          # Další kurzy
└── deployment/           # Deployment skripty
```

## Hlavní funkcionality

### Správa kurzů
- Načítání kurzů z YAML souborů v adresáři `data/`
- Podpora lokálních dat i dat z naucse.python.cz API
- Automatické řazení kurzů podle data
- Rozlišení aktivních a proběhlých kurzů

### Uživatelé
- Registrace a přihlášení (lokální, Facebook, Google)
- Role: student, kouč, admin
- Přiřazování uživatelů ke kurzům

### Úkoly a řešení
- Odevzdávání řešení úkolů studenty
- CodeMirror editor s podporou Pythonu
- Komentáře a review od koučů
- Historie odevzdaných řešení

### Admin rozhraní
- Správa uživatelů (`/admin/users`)
- Správa kurzů (`/admin/courses`)
- Přiřazování rolí a kurzů

## Lokální vývoj

### Požadavky
- Node.js >= 10.0
- Python >= 3.6 (+ python3-venv na Ubuntu)
- MongoDB 4+

### Spuštění

Ve třech samostatných terminálech:

```bash
# MongoDB
make run-mongod
# nebo přes Docker:
docker run --rm -it -p 27017:27017 mongo:4

# Backend (port 5000)
make run-backend

# Frontend (port 3000)
make run-frontend
```

Aplikace bude dostupná na http://localhost:3000/

### Developer login

Pro usnadnění vývoje lze povolit rychlé přihlášení různých rolí:

```bash
export ALLOW_DEV_LOGIN=1
make run-backend
```

## Datové modely

### Kurzy
- ID, název, popis
- Datum začátku a konce
- Seznam lekcí (sessions)
- Úkoly přiřazené k lekcím

### Uživatelé
- Jméno, email, heslo (hashované)
- Role v systému
- Přiřazené kurzy (jako student/kouč)

### Řešení úkolů (TaskSolutions)
- Reference na úkol, uživatele a kurz
- Kód řešení
- Časová razítka
- Stav (odevzdáno, zrevidováno, atd.)

### Komentáře k řešením
- Reference na řešení
- Autor komentáře
- Text komentáře
- Časové razítko

## API endpointy

### Autentizace
- `/api/auth/login` - přihlášení
- `/api/auth/logout` - odhlášení
- `/api/auth/register` - registrace

### Data stránek
- `/api/page-data/*` - data pro jednotlivé stránky

### Úkoly
- `/api/tasks/submit-solution` - odevzdání řešení
- `/api/tasks/load-solution` - načtení řešení
- `/api/tasks/solution-comments` - komentáře k řešení

### Admin
- `/api/admin/users/*` - správa uživatelů
- `/api/admin/courses/*` - správa kurzů

## Testy

Backend testy:
```bash
cd backend
pip install -r requirements-tests.txt
pytest tests/
```

## Deployment

- CI/CD přes CircleCI
- Automatický deployment `stable` větve na produkci
- Automatický deployment `master` větve na demo
- Docker obrazy pro frontend i backend

## Struktura datových souborů

### courses.yaml

Hlavní soubor `/data/courses.yaml` obsahuje seznam všech kurzů:

```yaml
courses:
- file: 2024_pyladies_praha_autumn/course.yaml
- file: 2025_pydata_praha_autumn/course.yaml
# ...další kurzy
```

### course.yaml

Každý kurz má vlastní soubor `course.yaml` s detaily kurzu. Existují dva typy kurzů:

#### 1. Kurzy s lokálními daty

```yaml
id: pydata-2025-praha-podzim          # Unikátní ID kurzu
title: Datový kurz PyLadies           # Název kurzu
subtitle: Praha – podzim 2025          # Podtitul
description: PyLadies a PyData Prague  # Popis
start_date: 2025-09-15                 # Datum začátku (YYYY-MM-DD)
end_date: 2025-12-24                   # Datum konce (YYYY-MM-DD)
registration_end: 2025-09-30           # Konec registrace - do tohoto data se zobrazuje
                                       # tlačítko pro přihlášení, poté lze přiřadit
                                       # uživatele pouze v administraci (YYYY-MM-DD)

sessions:                              # Seznam lekcí
  - title: Představení, Jupyter notebook, základy pandas
    date: 2025-09-15                   # Datum lekce
    slug: 1-predstaveni-jupyter-notebook-zaklady-pandas  # URL slug
    materials:                         # Studijní materiály
      - attachment: Instalace          # Název materiálu
        url: https://...               # URL na materiál
      - attachment: Jupyter Notebook intro
        url: https://...
    tasks:                             # Úkoly pro tuto lekci (volitelné)
      - file: tasks/01_jupyter_pandas.yaml  # Cesta k souboru s úkoly
  # ...další lekce
```

#### 2. Kurzy napojené na naucse.python.cz

```yaml
id: pyladies-praha-podzim2024
naucse_api_url: https://naucse.python.cz/v0/2024/praha-pyladies-podzim.json
registration_end: 2024-10-03           # Konec registrace (viz výše)
tasks_by_lesson_slug:                  # Mapování lekcí na úkoly
  "beginners/first-steps":             # Slug lekce z naucse
  - file: tasks/01_prvni_program.yaml  # Cesta k souboru s úkoly
  "beginners/variables":
  - file: tasks/02_promenne_podminky.yaml
  # ...další mapování
```

### Soubory s úkoly (tasks/*.yaml)

Úkoly pro jednotlivé lekce jsou definovány v souborech v adresáři `tasks/`:

```yaml
tasks:
  - id: handout01_00                   # Unikátní ID úkolu
    markdown: |                        # Text úkolu (Markdown)
      Na hodině jsme se naučili pracovat s interaktivní Python konzolí.
      Zkus pomocí Pythonu vypočítat: 3+(4+6)×8÷2−1 =
    submit: true                       # Lze odevzdat (výchozí: true)

  - section:                           # Sekce (neodevzdává se)
      markdown: |
        **Co po této lekci umím:**

  - id: handout01_01
    markdown: |
      Jsou i jiné operátory než `+`, `-` a ty pro násobení a dělení.
      Co dělá s čísly operátor `%` (procento)?
```

## Známé problémy a TODO

- Dokončit workflow pro review úkolů
- Přidat GitHub login
- Implementovat notifikace (in-app, Slack, email)
- Dodělat kompletní admin rozhraní
- Přidat odevzdávání přes GitHub

Viz [GitHub Issues](https://github.com/messa/pyladies-courseware/issues) pro kompletní seznam.
