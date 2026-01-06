console.log("RUN");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://yrypvjywiwjxcqdofwta.supabase.co";
const supabaseKey = "sb_publishable_cBCBvmcNfUiXatltBOTciQ_IzVeMFXu";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected:", supabase);

let username = "";
let question = [];
let score = 0;
let current = 0;
let currentQuizCode = "";

function firstbutton() {
    console.log("firstbutton() called");
    username = document.getElementById("input").value.trim();
    console.log("Username:", username);

    if (username === "") {
        alert("Invalid Username");
        return;
    }

    let secondDesign = document.getElementById("second-design");
    secondDesign.textContent = `Welcome, ${username}`;

    showpage("second");
    
}

function showpage(id) {
    console.log("showpage() called with id:", id);

    let currentP = document.querySelector(".page.active");
    if (currentP) {
        currentP.classList.remove("active");
        console.log("Removed active class from:", currentP.id);
    }

    let n = document.getElementById(id);
    if (n) {
        setTimeout(() => {
            n.classList.add("active");
            console.log("Added active class to:", id);

            history.pushState({ page: id }, "", `#${id}`);
        }, 20);
    } else {
        console.error("Page not found:", id);
    }
}


window.addEventListener("popstate", (e) => {
    console.log("popstate event triggered", e.state);

    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));

    if (e.state && e.state.page) {
        let targetPage = document.getElementById(e.state.page);
        if (targetPage) {
            setTimeout(() => {
                targetPage.classList.add("active");
                console.log("Restored page:", e.state.page);
            }, 20);
        }
    }
});


window.addEventListener("DOMContentLoaded", () => {
    let hash = window.location.hash.substring(1);
    if (hash) {
        showpage(hash);
    } else {
        history.replaceState({ page: "container" }, "", "#container");
    }
});

async function addquestion() {
    console.log("addquestion() called");

    let a = document.getElementById("teacher-question").value.trim();
    let choices = [
        document.getElementById("teacher-option-0").value.trim(),
        document.getElementById("teacher-option-1").value.trim(),
        document.getElementById("teacher-option-2").value.trim(),
        document.getElementById("teacher-option-3").value.trim(),
    ];
    let correct = document.querySelector("input[name=option]:checked");

    console.log("Question:", a);
    console.log("Choices:", choices);
    console.log("Correct answer:", correct ? correct.value : "none selected");

    if (!a || choices.some((c) => !c) || !correct) {
        alert("Please fill all fields and select the correct answer.");
        return;
    }

    question.push({
        question: a,
        choice: choices,
        answer: parseInt(correct.value),
    });

    document.getElementById("teacher-question").value = "";
    document.getElementById("teacher-option-0").value = "";
    document.getElementById("teacher-option-1").value = "";
    document.getElementById("teacher-option-2").value = "";
    document.getElementById("teacher-option-3").value = "";
    correct.checked = false;

    alert(`Question added! Total questions: ${question.length}`);
    console.log("All questions:", question);
}

async function saveQuiz() {
    console.log("saveQuiz() called");
    const quizCode = document.getElementById("quiz-code").value.trim();
    console.log("Quiz code:", quizCode);

    if (!quizCode) {
        alert("Enter a quiz code");
        return;
    }
    if (question.length === 0) {
        alert("Add at least one question");
        return;
    }

    try {
        const { data, error } = await supabase
            .from("Onato")
            .insert({ code: quizCode, questions: question, name: username });

        if (error) {
            console.error("Supabase error:", error);
            alert("Error saving quiz: " + error.message);
        } else {
            alert("Quiz saved! Code: " + quizCode);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
    }
}

async function joinRoom() {
    const roomCode = document.getElementById("student-type-code").value.trim();
    if (!roomCode) {
        alert("Please enter a room code");
        return;
    }

    try {
        const { data, error } = await supabase
            .from("Onato")
            .select("questions")
            .eq("code", roomCode)
            .single();

        if (error || !data) {
            alert("Quiz not found! " + (error ? error.message : ""));
            return;
        }

        question = data.questions;
        currentQuizCode = roomCode;
        score = 0;
        current = 0;

        showpage("Quiz-area");
        Showquiz();
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
    }
}

function start() {
    if (question.length === 0) {
        alert("Please add questions first!");
        return;
    }
    score = 0;
    current = 0;
    showpage("Quiz-area");
    Showquiz();
}



async function saveScore() {
    console.log("saveScore() called");
    console.log("Saving score for:", username, "Quiz:", currentQuizCode, "Score:", score);
    
    try {
        const { error } = await supabase
            .from("QuizResults")  
            .insert({
                quiz_code: currentQuizCode,
                student_name: username,
                score: score,
                total_questions: question.length
            });
        
        if (error) {
            console.error("Error saving score:", error);
            alert("Score couldn't be saved: " + error.message);
        } else {
            console.log("Score saved successfully!");
            alert("Your score has been saved!");
        }
    } catch (err) {
        console.error("Catch error saving score:", err);
        alert("Unexpected error: " + err.message);
    }
}

function Showquiz() {
    if (current >= question.length) {
        saveScore();
       const quizArea = document.getElementById("Quiz-area");

quizArea.style.display = "block";
quizArea.innerHTML = `
    <div id="quizscore" class="onat">
        <h1 style="font-family: 'Times New Roman', Times, serif;
    color: wheat;">Quiz Finished!</h1> <hr>
        <p style="font-size: 45px;
    color: wheat;
    font-family: 'Times New Roman', Times, serif;"><strong>${username}</strong>, your score: ${score}/${question.length}</p>
    </div>
        `;
        alert(`Quiz finished! Your score: ${score}/${question.length}`);
        return;
    }

    let q = question[current];
    let otano = `<div class="quizbox"><h3>${q.question}</h3>`;
    q.choice.forEach((el, i) => {
        otano += `<button class="choicebtn" onclick="checking(${i})">${el}</button><br>`;
    });
    otano += `</div>`;
    document.getElementById("Quiz-area").style.display = "block";
    document.getElementById("Quiz-area").innerHTML = otano;
}


function checking(selected) {
    const isCorrect = selected === question[current].answer;
    const correctAnswer = question[current].answer;

    const buttons = document.querySelectorAll('.choicebtn');
    buttons.forEach(btn => btn.disabled = true);
    

    buttons[correctAnswer].style.background = 'linear-gradient(135deg, #13930cff, #2f8a0bff)';
    buttons[correctAnswer].style.transform = 'scale(1.05)';
    

    const body = document.body;
    if (isCorrect) {
        score++;
        body.style.boxShadow = 'inset 0 0 100px 20px rgba(51, 255, 0, 0.6)';
    } else {
        body.style.boxShadow = 'inset 0 0 100px 20px rgba(255, 0, 0, 1)';

        buttons[selected].style.background = 'linear-gradient(135deg, #960f0fff, #8e1111ff)';
    }
    
    setTimeout(() => {
        body.style.boxShadow = 'none';
        current++;
        Showquiz();
    }, 1500);
}


const button1 = document.getElementById("first-button-container");
const button2 = document.getElementById("T-button");
const button3 = document.getElementById("S-button");
const button4 = document.getElementById("L-button");
const button5 = document.getElementById("student-button");
const button6 = document.getElementById("teacher-button");
const button7 = document.getElementById("start");
const button8 = document.getElementById("teacher-generate-code");
const button9 = document.getElementById("view-leaderboard-btn");

const sound = document.getElementById("sound");
  

  button1.addEventListener("click", function () {
    sound.play();
  });
  button2.addEventListener("click", function () {
    sound.play();
  });
  button3.addEventListener("click", function () {
    sound.play();
  });
  button4.addEventListener("click", function () {
    sound.play();
  });
  button5.addEventListener("click", function () {
    sound.play();
  });
  button6.addEventListener("click", function () {
    sound.play();
  });
  button7.addEventListener("click", function () {
    sound.play();
  });
  button8.addEventListener("click", function () {
    sound.play();
  });
  button9.addEventListener("click", function () {
    sound.play();
  });
  







document.addEventListener('DOMContentLoaded', function() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 1.0;
        
        
        bgMusic.play().catch(function(error) {
            console.log("Autoplay blocked. Music will start on first click.");
            
            
            document.addEventListener('click', function() {
                bgMusic.play();
            }, { once: true });
        });
    }
});

async function viewLeaderboard() {
    console.log("viewLeaderboard() called");
    
    const quizCode = document.getElementById("leaderboard-quiz-code").value.trim();
    console.log("Quiz code entered:", quizCode);
    
    if (!quizCode) {
        alert("Please enter a quiz code");
        return;
    }
    
    try {
        console.log("Fetching leaderboard data from Supabase...");
        const { data, error } = await supabase
            .from("QuizResults")
            .select("*")
            .eq("quiz_code", quizCode)
            .order("score", { ascending: false })
            .order("created_at", { ascending: true });
        
        console.log("Supabase response:", { data, error });
        
        if (error) {
            console.error("Error fetching leaderboard:", error);
            alert("Error loading leaderboard: " + error.message);
            return;
        }
        
        const leaderboardContent = document.getElementById("leaderboard-content");
        
        if (!data || data.length === 0) {
            leaderboardContent.innerHTML = '<p class="no-results">No results found for this quiz code.</p>';
            console.log("No results found");
            return;
        }
        
        console.log("Found", data.length, "results");
        
        let html = '';
        data.forEach((entry, index) => {
            const rank = index + 1;
            const topClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            
            html += `
                <div class="leaderboard-entry ${topClass}">
                    <span class="leaderboard-rank">${medal || rank}</span>
                    <span class="leaderboard-name">${entry.student_name}</span>
                    <span class="leaderboard-score">${entry.score}/${entry.total_questions}</span>
                </div>
            `;
        });
        
        leaderboardContent.innerHTML = html;
        console.log("Leaderboard displayed successfully");
        
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
    }
}

window.firstbutton = firstbutton;
window.showpage = showpage;
window.addquestion = addquestion;
window.saveQuiz = saveQuiz;
window.joinRoom = joinRoom;
window.start = start;
window.checking = checking;
window.viewLeaderboard = viewLeaderboard;
console.log("All functions loaded to window object");


