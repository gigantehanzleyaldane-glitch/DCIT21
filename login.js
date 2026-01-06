function signup() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "" || password === "") {
        document.getElementById("message").innerText = "All fields required!";
        return;
    }

    localStorage.setItem(username, password);
    document.getElementById("message").innerText = "Signup successful!";
}

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let storedPassword = localStorage.getItem(username);

    if (storedPassword === password) {
        document.getElementById("message").innerText = "Login successful!";
        document.getElementById("message").style.color = "green";
        window.location.href = "index.html"
    } else {
        document.getElementById("message").innerText = "Invalid username or password!";
    }
}
