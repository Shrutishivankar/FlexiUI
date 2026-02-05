# FlexiUI: A No-Code UI Builder

FlexiUI is a no-code platform that allows users to design and build responsive websites and UIs without writing code. With its drag-and-drop editor, real-time preview, and export features, FlexiUI makes web development fast, simple, and accessible for everyone.

---

## Features

- **Drag & Drop UI Builder** – Easily add, move, and resize components.  
- **Inline Editing** – Edit text, styles, and properties in real time.  
- **Pre-built Components** – Headers, buttons, carousels, cards, and more.  
- **Real-time Preview** – See instant changes as you design.  
- **Save Templates** – Store templates in a database (SQLite/Flask backend).  
- **Export Options** – Download your design as HTML, PDF, or image.  
- **Customization** – Update colors, fonts, and layouts effortlessly.  

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Bootstrap for styling)  
- **Backend:** Python (Flask)  
- **Database:** SQLite (via SQLAlchemy)  
- **Other Tools:** PDF/Image export libraries  

---

## Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Shrutishivankar/FlexiUI.git
   cd FlexiUI

2. **Create a virtual environment & install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Linux/Mac
   venv\Scripts\activate      # On Windows
   pip install -r requirements.txt
   
3. **Run the app**
    ```bash
    python app.py
    
4. **Open in browser**
    ```bash
    http://127.0.0.1:5000/
