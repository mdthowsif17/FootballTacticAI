from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import pickle, json, os, hashlib
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
app.secret_key = 'football_tactical_secret_2026'

USERS_FILE = 'data/users.json'
HISTORY_FILE = 'data/match_history.json'
os.makedirs('data', exist_ok=True)

def load_json(path, default):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return default

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

MODELS = {}
def get_model(t):
    if t not in MODELS:
        with open(f'models/model_{t}.pkl', 'rb') as f:
            MODELS[t] = pickle.load(f)
    return MODELS[t]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select')
def select():
    if 'user' not in session:
        return redirect('/')
    return render_template('landing.html', user=session['user'])

@app.route('/match-select')
def match_select():
    if 'user' not in session:
        return redirect('/')
    return render_template('select.html', user=session['user'])

@app.route('/input/<match_type>')
def input_page(match_type):
    if 'user' not in session:
        return redirect('/')
    with open('static/js/label_data.json') as f:
        label_data = json.load(f)
    return render_template(f'input_{match_type}.html', user=session['user'], label_data=json.dumps(label_data))

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.json
    t = data['match_type']
    m = get_model(t)   


    
    try:
        features = []
        for c in m['cat_cols']:
            val = str(data.get(c, ''))
            le = m['encoders'][c]
            if val not in le.classes_:
                val = le.classes_[0]
            features.append(int(le.transform([val])[0]))
        for c in m['num_cols']:
            features.append(float(data.get(c, 0)))
        
        X = [features]
        cls_pred = m['clf'].predict(X)[0]
        reg_pred = float(m['reg'].predict(X)[0])
        
        result = {}
        for i, col in enumerate(m['out_cols']):
            result[col] = str(m['encoders'][col].inverse_transform([int(cls_pred[i])])[0])
        result['win_probability_increase'] = round(reg_pred, 1)
        result['match_type'] = t
        
        # Save to history
        history = load_json(HISTORY_FILE, {})
        user = session['user']
        if user not in history:
            history[user] = []
        history[user].append({
            'timestamp': datetime.now().isoformat(),
            'match_type': t,
            'input': data,
            'result': result
        })
        save_json(HISTORY_FILE, history)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    users = load_json(USERS_FILE, {})
    u, p = data.get('username','').strip(), data.get('password','')
    if not u or not p:
        return jsonify({'success': False, 'msg': 'Fields required'})
    if u in users and users[u]['password'] == hash_pw(p):
        session['user'] = u
        return jsonify({'success': True})
    return jsonify({'success': False, 'msg': 'Invalid credentials'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    users = load_json(USERS_FILE, {})
    u, p = data.get('username','').strip(), data.get('password','')
    if not u or not p:
        return jsonify({'success': False, 'msg': 'Fields required'})
    if u in users:
        return jsonify({'success': False, 'msg': 'Username taken'})
    if len(p) < 6:
        return jsonify({'success': False, 'msg': 'Password must be 6+ chars'})
    users[u] = {'password': hash_pw(p), 'created': datetime.now().isoformat()}
    save_json(USERS_FILE, users)
    session['user'] = u
    return jsonify({'success': True})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'success': True})

@app.route('/api/history')
def history():
    if 'user' not in session:
        return jsonify([])
    h = load_json(HISTORY_FILE, {})
    return jsonify(h.get(session['user'], []))

@app.route('/api/save_tracker', methods=['POST'])
def save_tracker():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.json
    history = load_json(HISTORY_FILE, {})
    user = session['user']
    if user not in history:
        history[user] = []
    history[user].append({
        'timestamp': datetime.now().isoformat(),
        'type': 'match_tracker',
        'data': data
    })
    save_json(HISTORY_FILE, history)
    return jsonify({'success': True})
@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    history = load_json(HISTORY_FILE, {})
    history[session['user']] = []
    save_json(HISTORY_FILE, history)
    return jsonify({'success': True})

@app.route('/api/check_session')
def check_session():
    return jsonify({'logged_in': 'user' in session, 'user': session.get('user', '')})
FOOTBALL_SYSTEM = """You are an expert football (soccer) coach and tactical analyst with 20+ years of experience.

STRICT LANGUAGE RULES:
1. ALWAYS start every conversation in ENGLISH only
2. Your very first response must be in pure English — no Tamil, no Tanglish
3. Only switch to Tanglish IF the user themselves writes in Tamil or Tanglish first
4. If user writes in English → Reply in English only
5. If user writes in Tamil/Tanglish → Reply in Tanglish
6. NEVER use "Vanakkam" or Tamil greetings unless user writes in Tamil first

FOOTBALL RULES:
1. Answer ONLY football-related questions
2. If non-football questions asked say: "I can only answer football-related questions! Ask me about tactics, formations, training or rules."
3. Give practical, actionable advice
4. Use bullet points for lists
5. Be encouraging and positive"""
@app.route('/api/chat', methods=['POST'])
def chat_api():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.json
    messages = data.get('messages', [])
    
    client = Groq(api_key=os.environ.get('GROQ_API_KEY', ''))
    
    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[
            {'role': 'system', 'content': FOOTBALL_SYSTEM},
            *messages
        ],
        max_tokens=1000
    )
    return jsonify({'reply': response.choices[0].message.content})
@app.route('/chat')
def chat():
    if 'user' not in session:
        return redirect('/')
    return render_template('chat.html', user=session['user'])
@app.route('/api/save_chat', methods=['POST'])
def save_chat():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.json
    history = load_json(HISTORY_FILE, {})
    user = session['user']
    if user not in history:
        history[user] = []
    # Chat history separate key la store pannu
    chat_key = f"chat_{user}"
    history[chat_key] = data.get('messages', [])
    save_json(HISTORY_FILE, history)
    return jsonify({'success': True})

@app.route('/api/load_chat')
def load_chat():
    if 'user' not in session:
        return jsonify([])
    history = load_json(HISTORY_FILE, {})
    user = session['user']
    chat_key = f"chat_{user}"
    return jsonify(history.get(chat_key, []))

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)
