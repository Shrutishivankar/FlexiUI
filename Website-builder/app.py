from flask import Flask, render_template, request, redirect, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt
import json
from sqlalchemy.sql import func

app = Flask(__name__, static_folder="static")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.secret_key = 'secret_key'

# Initialize database
db = SQLAlchemy(app)

## 1. Authentication Database Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

## 2. Components Database Model
class Component(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    html_content = db.Column(db.Text, nullable=False)    # Store the full HTML for rendering
    properties = db.Column(db.Text, default="{}")  # Store JSON properties, default as empty JSON `{}`

    def __init__(self, name, html_content, properties={}):
        self.name = name
        self.html_content = html_content
        self.properties = json.dumps(properties)  # Convert dictionary to JSON string

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "html_content": self.html_content,
            "properties": json.loads(self.properties)  # Convert back JSON string to dictionary
        }
    
## 3. Templates Database Model
class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # Template Name
    content = db.Column(db.Text, nullable=False)  # HTML Content of Template

    def __init__(self, name, content):
        self.name = name
        self.content = content   

## 4. Deployment Database Model
class Deployment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    html = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def __init__(self, name, html):
        self.name = name
        self.html = html

    def __repr__(self):
        return f'<Deployment {self.name}>'    

# Initialize the database (Run only once)
with app.app_context():
    db.create_all()


## 3. Routes for Frontend Pages
@app.route("/")
def index():
    return render_template("homePage.html")

@app.route("/register", methods=['GET','POST'])
def register():
    if request.method == 'POST':
        # handle request 
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        new_user = User(name=name, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        return redirect('login')

    return render_template("register.html")  

@app.route("/login", methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()   # find user by that particular email

        if user and user.check_password(password):
            session['name'] = user.name
            session['email'] = user.email
            session['password'] = user.password
            return redirect('/')
        else:
            return render_template("login.html", error='Invalid user!!')

    return render_template("login.html")          

@app.route("/main")
def main():
    return render_template("main.html")

@app.route("/business-template")
def business_template():
    return render_template("business-template.html")
@app.route("/portfolio-template")
def portfolio_template():
    return render_template("portfolio-template.html")
@app.route("/ecommerce-template")
def ecommerce_template():
    return render_template("ecommerce-template.html")

# 3.1) Create API to Save Templates :- to add a new API endpoint for saving templates
@app.route("/api/save-template", methods=['POST'])
def save_template():
    data = request.json
    name = data.get("name")
    content = data.get("content")

    if not name or not content:
        return jsonify({"success": False, "message": "Template name and content are required"}), 400

    # Check if the template already exists
    existing_template = Template.query.filter_by(name=name).first()
    if existing_template:
        existing_template.content = content  # Update existing template
    else:
        new_template = Template(name=name, content=content)
        db.session.add(new_template)

    db.session.commit()
    return jsonify({"success": True, "message": f"Template '{name}' saved successfully!"})

# API to Fetch Templates
@app.route("/api/get-templates", methods=['GET'])
def get_templates():
    templates = Template.query.all()
    templates_list = [{"id": t.id, "name": t.name, "content": t.content} for t in templates]
    return jsonify(templates_list)

# ______________________________________________________________________________________ 

## 2.1) API Routes for Components
# Add a New Component
@app.route("/api/components", methods=['POST'])
def add_component():
    data = request.json
    new_component = Component(
        name=data['name'],
        html_content=data['html_content'],  # Store HTML
        properties=data.get('properties', {})  # Default to empty JSON if not provided
    )
    db.session.add(new_component)
    db.session.commit()
    return jsonify({"message": "Component added successfully", "id": new_component.id}), 201

# Fetch All Components
@app.route("/api/components", methods=['GET'])
def get_components():
    components = Component.query.all()
    return jsonify([c.to_dict() for c in components])

# Fetch Single Component by ID
@app.route("/api/components/<int:id>", methods=['GET'])
def get_component(id):
    component = Component.query.get_or_404(id)
    return jsonify(component.to_dict())

# Update Component Properties Dynamically
@app.route("/api/components/<int:id>", methods=['PUT'])
def update_component(id):
    component = Component.query.get_or_404(id)
    data = request.json
    if "properties" in data:
        component.properties = json.dumps(data["properties"])  # Update only JSON properties
    db.session.commit()
    return jsonify({"message": "Component updated successfully"})


## 4.1. # Route to handle deployment creation
@app.route('/deploy', methods=['POST'])
def deploy():
    data = request.get_json()
    name = data.get('name')
    html_content = data.get('htmlContent')

    if not name or not html_content:
        return jsonify({"message": "Name and HTML content are required!"}), 400

    # Create a new deployment
    deployment = Deployment(name=name, html=html_content)
    db.session.add(deployment)
    db.session.commit()

    return jsonify({"message": "Deployment successful!", "deployment_id": deployment.id}), 201

# Route to get all deployments
@app.route('/deployments', methods=['GET'])
def get_deployments():
    deployments = Deployment.query.all()
    deployments_data = [{"id": d.id, "name": d.name, "created_at": d.created_at} for d in deployments]
    return jsonify(deployments_data)

if __name__ == "__main__":
    app.run(debug=True)