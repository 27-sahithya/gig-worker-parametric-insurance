import requests

# Test admin login
login_data = {'email': 'admin@rakshak.ai', 'password': 'admin123'}
response = requests.post('http://127.0.0.1:8000/auth/login', json=login_data)
print(f'Admin login status: {response.status_code}')
if response.status_code == 200:
    token = response.json()['access_token']
    print('Admin login successful')

    # Test getting users
    headers = {'Authorization': f'Bearer {token}'}
    users_response = requests.get('http://127.0.0.1:8000/admin/users', headers=headers)
    print(f'Get users status: {users_response.status_code}')
    if users_response.status_code == 200:
        users = users_response.json()
        pending_users = [u for u in users if u['status'] == 'pending']
        print(f'Pending users: {len(pending_users)}')
        for u in pending_users:
            print(f'  - {u["email"]} (ID: {u["id"]})')

        # Try to approve the first pending user
        if pending_users:
            user_id = pending_users[0]['id']
            approve_response = requests.post(f'http://127.0.0.1:8000/admin/approve/{user_id}', headers=headers)
            print(f'Approve user {user_id} status: {approve_response.status_code}')
            if approve_response.status_code == 200:
                print('Approval successful')
            else:
                print(f'Approval failed: {approve_response.text}')
    else:
        print(f'Get users failed: {users_response.text}')
else:
    print(f'Admin login failed: {response.text}')