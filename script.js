// ==========================================
// RIO LARGO DIGITAL - APPLICATION LOGIC
// ==========================================

// Global App State
const state = {
    user: {
        name: "Gustavo Santos de Oliveira",
        cpf: "123.456.789-00",
        citizenshipPoints: 350,
        badges: ["Cidadão Ativo", "Fiscal do Bairro"],
        address: "Av. Fernando Collor, Centro, Rio Largo",
        susNumber: "898 0012 3456 7890",
        kids: [
            { name: "Lucas Santos", school: "Escola Municipal Dr. Afonso de Melo", grade: "6º Ano" }
        ],
        protocols: [
            { id: "RL-3882", type: "Buraco na Via", status: "Em Execução", date: "Hoje, 16:35", steps: [
                { title: "Chamado Aberto", desc: "Hoje, 16:35 por Gustavo Santos", completed: true },
                { title: "Analisado pela Secretaria", desc: "Hoje, 16:36 pela Infraestrutura", completed: true },
                { title: "Equipe em Rota de Serviço", desc: "Cronograma estimado: Conclusão hoje", completed: false }
            ]}
        ]
    },
    dashboard: {
        nps: 78,
        openProtocols: 24,
        resolvedProtocols: 142,
        budgetExecuted: 14.8,
        satisfactionSaude: 8.2,
        satisfactionEdu: 8.8,
        satisfactionInfra: 7.1,
    },
    currentOcorrencia: {
        type: "buraco",
        desc: "",
        photo: null
    }
};

// Available Medicines Mock Database
const medicinesDb = [
    { name: "Dipirona Monoidratada 500mg", location: "UBS Centro", qty: 120, status: "available" },
    { name: "Ibuprofeno 600mg", location: "UBS Lourenço de Albuquerque", qty: 0, status: "unavailable" },
    { name: "Paracetamol 500mg", location: "UBS Centro", qty: 85, status: "available" },
    { name: "Amoxicilina 500mg", location: "UBS Mutirão", qty: 40, status: "available" },
    { name: "Losartana Potássica 50mg", location: "UBS Centro", qty: 210, status: "available" }
];

// Initial Setup on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    // Start live clock
    updateClock();
    setInterval(updateClock, 60000);
});

// Update Phone Time
function updateClock() {
    const timeDisplay = document.getElementById("phone-clock");
    if (timeDisplay) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
    }
}

// Switch view between Both, Mobile, or Dashboard
function switchView(view) {
    const workspace = document.getElementById("main-workspace");
    const colApp = document.getElementById("column-app");
    const colDash = document.getElementById("column-dashboard");
    
    // Reset classes
    document.querySelectorAll(".system-tab-btn").forEach(btn => btn.classList.remove("active"));
    
    if (view === 'both') {
        document.getElementById("btn-tab-both").classList.add("active");
        workspace.style.gridTemplateColumns = "460px 1fr";
        colApp.style.display = "flex";
        colDash.style.display = "block";
    } else if (view === 'app') {
        document.getElementById("btn-tab-app").classList.add("active");
        workspace.style.gridTemplateColumns = "1fr";
        colApp.style.display = "flex";
        colDash.style.display = "none";
    } else if (view === 'dash') {
        document.getElementById("btn-tab-dash").classList.add("active");
        workspace.style.gridTemplateColumns = "1fr";
        colApp.style.display = "none";
        colDash.style.display = "block";
    }
}

// Navigate Screen Views inside phone
function navigateTo(screenId) {
    // Hide all view screens
    document.querySelectorAll(".view-screen").forEach(screen => {
        screen.classList.remove("active");
    });
    
    // Show requested screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add("active");
        // Scroll back to top
        document.getElementById("app-views-scroller").scrollTop = 0;
    }

    // Adjust active states in bottom navigation bar
    const bottomNav = document.getElementById("app-bottom-navbar");
    
    // Hide bottom navbar on login screen
    if (screenId === 'login') {
        bottomNav.style.display = "none";
    } else {
        bottomNav.style.display = "flex";
    }

    // Set active tab class
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
    
    if (screenId === 'home') {
        document.querySelector(".nav-item:nth-child(1)").classList.add("active");
    } else if (screenId === 'meubairro') {
        document.querySelector(".nav-item:nth-child(2)").classList.add("active");
    } else if (screenId === 'seguranca') {
        document.querySelector(".nav-item:nth-child(3)").classList.add("active");
    } else if (screenId === 'chat') {
        document.querySelector(".nav-item:nth-child(4)").classList.add("active");
    } else if (screenId === 'perfil') {
        document.querySelector(".nav-item:nth-child(5)").classList.add("active");
    }
}

// Show Toast Alert Notification
function showToast(text, duration = 4000) {
    const toast = document.getElementById("app-toast-notification");
    const toastText = document.getElementById("app-toast-text");
    toastText.textContent = text;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// Add Item into Prefeito dashboard activity log
function logDashboardActivity(text, isAlert = false) {
    const logList = document.getElementById("dashboard-activity-log");
    if (!logList) return;

    const logItem = document.createElement("div");
    logItem.className = "log-item";
    if (isAlert) {
        logItem.style.borderLeftColor = "var(--accent-red)";
    } else {
        logItem.style.borderLeftColor = "var(--accent-blue)";
    }
    
    logItem.innerHTML = `
        <span class="log-item-text">${text}</span>
        <span class="log-item-time">Agora mesmo</span>
    `;
    
    logList.insertBefore(logItem, logList.firstChild);
}

// ==========================================
// INTERACTIONS - AUTHENTICATION
// ==========================================

function handleLogin() {
    const cpfInput = document.getElementById("login-cpf").value;
    const lgpdCheck = document.getElementById("chk-lgpd").checked;

    if (!lgpdCheck) {
        showToast("Você precisa aceitar os termos da LGPD.");
        return;
    }

    if (cpfInput.length < 11) {
        showToast("CPF Inválido. Digite um CPF completo.");
        return;
    }

    showToast("Autenticando...");
    setTimeout(() => {
        navigateTo('home');
        showToast("Bem-vindo de volta, Gustavo!");
        logDashboardActivity("Gustavo Santos acessou o Super App Rio Largo Digital");
    }, 800);
}

function handleBiometrics() {
    showToast("Simulando FaceID / Impressão Digital...");
    
    // Simulate short scanning animation on mockup
    const screen = document.getElementById("phone-screen-container");
    const scannerOverlay = document.createElement("div");
    scannerOverlay.style.position = "absolute";
    scannerOverlay.style.top = "0";
    scannerOverlay.style.left = "0";
    scannerOverlay.style.width = "100%";
    scannerOverlay.style.height = "100%";
    scannerOverlay.style.backgroundColor = "rgba(11, 37, 69, 0.9)";
    scannerOverlay.style.zIndex = "1005";
    scannerOverlay.style.display = "flex";
    scannerOverlay.style.flexDirection = "column";
    scannerOverlay.style.alignItems = "center";
    scannerOverlay.style.justifyContent = "center";
    scannerOverlay.innerHTML = `
        <svg width="60" height="60" fill="var(--accent)" viewBox="0 0 24 24" style="animation: pulseBorder 1s infinite;">
            <path d="M12 1c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        <span style="color: white; font-size:12px; font-weight:700; margin-top:12px;">Escaneando...</span>
    `;
    screen.appendChild(scannerOverlay);
    
    setTimeout(() => {
        scannerOverlay.remove();
        navigateTo('home');
        showToast("Autenticado via Biometria!");
        logDashboardActivity("Gustavo Santos autenticou via Biometria");
    }, 1200);
}

// ==========================================
// ACCESSIBILITY CONTROL
// ==========================================

function toggleContrast() {
    document.body.classList.toggle("high-contrast");
    const contrastEnabled = document.body.classList.contains("high-contrast");
    showToast(contrastEnabled ? "Alto contraste ativado" : "Alto contraste desativado");
}

function toggleFontSize() {
    document.body.classList.toggle("large-font");
    const largeEnabled = document.body.classList.contains("large-font");
    showToast(largeEnabled ? "Fonte ampliada ativada" : "Fonte padrão ativada");
}

// ==========================================
// SAÚDE INTERACTIONS
// ==========================================

function flipSusCard() {
    const card = document.querySelector(".sus-card");
    const numberLbl = document.getElementById("sus-card-number-lbl");
    
    if (numberLbl.textContent.includes("898")) {
        numberLbl.textContent = "QR Code Gerado para Leitura";
        card.style.background = "linear-gradient(135deg, #0f172a, #1e293b)";
        // Create simple mock QR block
        const qr = document.createElement("div");
        qr.id = "mock-qr";
        qr.style.width = "48px";
        qr.style.height = "48px";
        qr.style.backgroundColor = "white";
        qr.style.position = "absolute";
        qr.style.right = "20px";
        qr.style.top = "46px";
        qr.style.border = "4px solid #fff";
        qr.innerHTML = `<div style="width:100%; height:100%; background: repeating-linear-gradient(45deg, #000, #000 4px, #fff 4px, #fff 8px);"></div>`;
        card.appendChild(qr);
        showToast("Cartão SUS: Apresente o QR Code no posto.");
    } else {
        numberLbl.textContent = state.user.susNumber;
        card.style.background = "linear-gradient(135deg, #0284C7, #0369A1)";
        const qr = document.getElementById("mock-qr");
        if (qr) qr.remove();
    }
}

function searchMedicine() {
    const query = document.getElementById("input-med-search").value.toLowerCase();
    const resultsContainer = document.getElementById("med-results-list");
    resultsContainer.innerHTML = "";
    
    const filtered = medicinesDb.filter(med => med.name.toLowerCase().includes(query));
    
    if (filtered.length === 0) {
        resultsContainer.innerHTML = `<p style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 12px 0;">Nenhum medicamento encontrado.</p>`;
        return;
    }
    
    filtered.forEach(med => {
        const item = document.createElement("div");
        item.className = "med-item";
        item.innerHTML = `
            <div class="med-info">
                <h5>${med.name}</h5>
                <p>${med.location} - ${med.qty > 0 ? `${med.qty} unidades` : 'Sem estoque'}</p>
            </div>
            <span class="med-status ${med.status}">${med.qty > 0 ? 'Disponível' : 'Indisponível'}</span>
        `;
        resultsContainer.appendChild(item);
    });
}

// ==========================================
// EDUCAÇÃO INTERACTIONS
// ==========================================

function simulateMatricula() {
    showToast("Realizando Matrícula Online...");
    
    setTimeout(() => {
        showToast("Matrícula de Lucas Santos realizada com sucesso!");
        logDashboardActivity("Lucas Santos foi matriculado na Escola Dr. Afonso via Super App");
        
        // Award points
        state.user.citizenshipPoints += 50;
        updatePointsDisplay();
        
        // Show points alert
        showToast("Você ganhou +50 pontos de cidadania!");
    }, 1500);
}

// ==========================================
// INFRAESTRUTURA INTERACTIONS (ZELADORIA)
// ==========================================

function goToInfraStep(stepNum) {
    // Hide content blocks
    document.getElementById("infra-step-1-content").style.display = "none";
    document.getElementById("infra-step-2-content").style.display = "none";
    document.getElementById("infra-step-3-content").style.display = "none";
    
    // Reset step indicators active states
    document.querySelectorAll(".step-indicator-item").forEach(indicator => {
        indicator.classList.remove("active");
    });

    // Show step block
    document.getElementById(`infra-step-${stepNum}-content`).style.display = "block";
    
    // Highlight indicators up to active step
    for (let i = 1; i <= stepNum; i++) {
        document.getElementById(`step-id-${i}`).classList.add("active");
    }
}

function simulateCameraPhoto() {
    const photoBox = document.getElementById("infra-photo-box");
    showToast("Simulando Câmera...");
    
    photoBox.innerHTML = `
        <div style="width:100%; height:100%; background: linear-gradient(135deg, #4b5563, #1f2937); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:800; text-transform:uppercase; text-align:center; padding:10px;">
            FOTO DETECTADA: BURACO NA AV. FERNANDO COLLOR
        </div>
    `;
    state.currentOcorrencia.photo = "dummy_pothole.jpg";
    showToast("Foto capturada com sucesso!");
}

function submitInfraOcorrencia() {
    const typeSelect = document.getElementById("select-infra-type");
    const descText = document.getElementById("input-infra-desc").value;
    const typeLabel = typeSelect.options[typeSelect.selectedIndex].text;
    
    const protocolId = `RL-${Math.floor(1000 + Math.random() * 9000)}`;
    
    showToast("Enviando ocorrência...");
    
    setTimeout(() => {
        // Register new protocol
        const newProtocol = {
            id: protocolId,
            type: typeLabel,
            status: "Recebido",
            date: "Hoje",
            steps: [
                { title: "Chamado Aberto", desc: "Hoje, pelo cidadão Gustavo Santos", completed: true },
                { title: "Analisado pela Secretaria", desc: "Aguardando verificação técnica", completed: false },
                { title: "Equipe em Rota de Serviço", desc: "Planejado", completed: false }
            ]
        };
        
        state.user.protocols.unshift(newProtocol);
        
        // Update user profile display
        updateProfileProtocolsList(newProtocol);
        
        // Show success screen inside mock
        const successBox = document.getElementById("infra-success-box");
        successBox.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: var(--accent-green); margin-bottom: 12px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            <h4 style="color: var(--primary); font-size: 14px; font-weight: 800;">Ocorrência Registrada!</h4>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 6px;">Protocolo: <strong>#${protocolId}</strong></p>
            <p style="font-size: 9px; color: var(--text-secondary); margin-top: 2px;">Você pode acompanhar o andamento em tempo real no seu perfil.</p>
            <button class="btn-primary" style="margin-top:12px; background-color: var(--accent-blue);" onclick="navigateTo('perfil')">Ir para Meus Chamados</button>
        `;
        
        // Trigger interactions on Prefeito Dashboard
        state.dashboard.openProtocols += 1;
        document.getElementById("val-open-protocols").textContent = state.dashboard.openProtocols;
        logDashboardActivity(`Novo chamado #${protocolId} (${typeLabel}) aberto por Gustavo no Centro`);
        
        // Show pin on dashboard heatmap
        const mapPin = document.getElementById("dynamic-map-pin");
        if (mapPin) {
            mapPin.style.display = "block";
            mapPin.title = `${typeLabel} - Centro (#${protocolId})`;
        }
        
        // Add points
        state.user.citizenshipPoints += 20;
        updatePointsDisplay();
        showToast("Você ganhou +20 pontos por relatar um problema!");

        // Simulate automatic resolution after 12 seconds
        simulateAutomaticResolution(protocolId);

    }, 1500);
}

function updateProfileProtocolsList(newProtocol) {
    const title = document.getElementById("active-protocol-title");
    const badge = document.getElementById("active-protocol-status-badge");
    const timeline = document.getElementById("active-protocol-timeline");
    
    title.textContent = `${newProtocol.type} (#${newProtocol.id})`;
    badge.textContent = newProtocol.status;
    badge.style.color = "var(--accent-blue)";
    
    timeline.innerHTML = `
        <div class="timeline-step completed">
            <div class="timeline-step-title">Chamado Aberto</div>
            <div class="timeline-step-desc">Hoje por Gustavo Santos</div>
        </div>
        <div class="timeline-step active">
            <div class="timeline-step-title">Aguardando Secretaria</div>
            <div class="timeline-step-desc">Em análise na Infraestrutura</div>
        </div>
        <div class="timeline-step">
            <div class="timeline-step-title">Serviço Concluído</div>
            <div class="timeline-step-desc">Planejado</div>
        </div>
    `;
}

// Simulate resolution to show the user-satisfaction prompt
function simulateAutomaticResolution(protocolId) {
    setTimeout(() => {
        // Notification toast
        showToast(`Alerta: Sua solicitação #${protocolId} foi resolvida pela Infraestrutura!`);
        
        // Update protocol in profile
        const title = document.getElementById("active-protocol-title");
        const badge = document.getElementById("active-protocol-status-badge");
        const timeline = document.getElementById("active-protocol-timeline");
        
        title.textContent = `Buraco Consertado (#${protocolId})`;
        badge.textContent = "Concluído";
        badge.style.color = "var(--accent-green)";
        
        timeline.innerHTML = `
            <div class="timeline-step completed">
                <div class="timeline-step-title">Chamado Aberto</div>
                <div class="timeline-step-desc">Hoje por Gustavo</div>
            </div>
            <div class="timeline-step completed">
                <div class="timeline-step-title">Chamado Analisado e Aprovado</div>
                <div class="timeline-step-desc">Equipe de tapa-buraco enviada</div>
            </div>
            <div class="timeline-step completed">
                <div class="timeline-step-title">Asfalto Aplicado com Sucesso</div>
                <div class="timeline-step-desc">Serviço concluído às ${new Date().toLocaleTimeString().substring(0, 5)}</div>
            </div>
        `;
        
        // Reveal Rating Button
        document.getElementById("btn-satisfaction-trigger").style.display = "block";
        
        // Telemetry update in Prefeito Dash
        state.dashboard.openProtocols -= 1;
        state.dashboard.resolvedProtocols += 1;
        document.getElementById("val-open-protocols").textContent = state.dashboard.openProtocols;
        logDashboardActivity(`Ocorrência #${protocolId} no Centro concluída pela equipe técnica`, false);
        
        // Remove pin from map
        const mapPin = document.getElementById("dynamic-map-pin");
        if (mapPin) mapPin.style.display = "none";
        
        // Trigger automated AI evaluation alert
        document.getElementById("dashboard-ai-rec").innerHTML = `
            <strong>IA Alerta:</strong> O chamado de zeladoria #${protocolId} foi concluído em tempo recorde (12s para testes). Aguardando feedback de satisfação do cidadão.
        `;

    }, 10000);
}

// ==========================================
// TRIBUTOS INTERACTIONS
// ==========================================

function copyPixCode() {
    showToast("Código PIX Copiado!");
    const btn = document.querySelector("#iptu-pix-box button");
    btn.textContent = "Código Copiado!";
    btn.style.backgroundColor = "var(--accent-green)";
    
    // Simulate pay after copy
    setTimeout(() => {
        showToast("Simulando Recebimento de Pix...");
        logDashboardActivity("Gustavo Santos quitou IPTU 2026 via PIX (R$ 240,00)");
        
        // Upgrade budget execute
        state.dashboard.budgetExecuted += 0.1;
        
        // Update home screen widget
        const items = document.querySelectorAll(".summary-item span");
        items[2].textContent = "IPTU 2026 Pago ✔";
        items[2].parentElement.style.opacity = "0.7";
        
        showToast("Pagamento de IPTU compensado!");
    }, 4000);
}

function payWithCard() {
    showToast("Abrindo portal de pagamento...");
    // Mock modal input card
    const cardModal = document.createElement("div");
    cardModal.style.position = "absolute";
    cardModal.style.top = "0";
    cardModal.style.left = "0";
    cardModal.style.width = "100%";
    cardModal.style.height = "100%";
    cardModal.style.backgroundColor = "rgba(0,0,0,0.7)";
    cardModal.style.zIndex = "1006";
    cardModal.style.display = "flex";
    cardModal.style.alignItems = "center";
    cardModal.style.justifyContent = "center";
    cardModal.style.padding = "20px";
    cardModal.innerHTML = `
        <div style="background: white; width:100%; border-radius:16px; padding:20px; text-align:left;">
            <h4 style="color:var(--primary); font-weight:800; font-size:13px; margin-bottom:12px;">Pagar com Cartão de Crédito</h4>
            <div class="input-group">
                <label style="font-size:10px;">Número do Cartão</label>
                <input type="text" class="input-field" value="4556 •••• •••• 8894" style="padding:10px;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="input-group">
                    <label style="font-size:10px;">Validade</label>
                    <input type="text" class="input-field" value="08/29" style="padding:10px;">
                </div>
                <div class="input-group">
                    <label style="font-size:10px;">CVV</label>
                    <input type="text" class="input-field" value="***" style="padding:10px;">
                </div>
            </div>
            <button class="btn-primary" id="btn-card-pay-submit" style="margin-top:10px;" onclick="confirmCardPayment(this)">Confirmar R$ 240,00</button>
            <button class="btn-primary" style="margin-top:6px; background-color: var(--text-secondary);" onclick="this.parentElement.parentElement.remove()">Cancelar</button>
        </div>
    `;
    document.getElementById("phone-screen-container").appendChild(cardModal);
}

function confirmCardPayment(btn) {
    btn.textContent = "Processando Transação...";
    btn.disabled = true;
    
    setTimeout(() => {
        btn.parentElement.parentElement.remove();
        showToast("IPTU pago via Cartão com Sucesso!");
        logDashboardActivity("Gustavo Santos quitou IPTU 2026 via Cartão de Crédito");
        
        // Update budget execute
        state.dashboard.budgetExecuted += 0.1;
        
        const items = document.querySelectorAll(".summary-item span");
        items[2].textContent = "IPTU 2026 Pago ✔";
        items[2].parentElement.style.opacity = "0.7";
    }, 1500);
}

// ==========================================
// SOCIAL PROGRAM INTERACTION
// ==========================================

function simulateSocialAppointment() {
    showToast("Agendando atendimento CRAS Centro...");
    
    setTimeout(() => {
        showToast("Atendimento agendado para 14/07 às 09:00!");
        logDashboardActivity("Gustavo Santos agendou atendimento assistencial no CRAS Centro");
        
        // Add summary item indicator
        const summaryGrid = document.querySelector(".summary-grid");
        const newItem = document.createElement("div");
        newItem.className = "summary-item";
        newItem.onclick = () => navigateTo('social');
        newItem.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            <span>CRAS agendado (14/07)</span>
        `;
        summaryGrid.appendChild(newItem);
    }, 1000);
}

// ==========================================
// SOS PANIC SYSTEM
// ==========================================

let sosTimer = null;
function triggerSOS() {
    const btn = document.getElementById("btn-sos-panic");
    const label = document.getElementById("sos-countdown");
    
    if (sosTimer) {
        // Cancel SOS
        clearInterval(sosTimer);
        sosTimer = null;
        label.textContent = "SOS Cancelado";
        btn.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.4)";
        showToast("Sinal de pânico cancelado.");
        return;
    }

    let seconds = 3;
    label.textContent = `Disparando em ${seconds}s...`;
    btn.style.boxShadow = "0 0 45px rgba(239, 68, 68, 0.8)";
    
    sosTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(sosTimer);
            sosTimer = null;
            label.textContent = "SOS ATIVADO!";
            showToast("Alerta SOS transmitido à Defesa Civil e Guarda!");
            logDashboardActivity("🚨 ALERTA DE PÂNICO SOS ATIVADO por Gustavo Santos (Centro)", true);
            
            // Add red pulsing glow to the entire mayor dashboard
            const dashboard = document.getElementById("column-dashboard");
            dashboard.style.boxShadow = "inset 0 0 50px rgba(239, 68, 68, 0.3)";
            setTimeout(() => {
                dashboard.style.boxShadow = "none";
            }, 6000);
        } else {
            label.textContent = `Disparando em ${seconds}s...`;
        }
    }, 1000);
}

// ==========================================
// CHATBOT IA LOGIC
// ==========================================

function handleChatKey(event) {
    if (event.key === "Enter") {
        sendChatMsg();
    }
}

function sendChatMsg() {
    const input = document.getElementById("chat-input");
    const query = input.value.trim();
    if (!query) return;

    appendChatBubble(query, "user");
    input.value = "";
    
    simulateAiResponse(query);
}

function sendChatPrompt(promptText) {
    appendChatBubble(promptText, "user");
    simulateAiResponse(promptText);
}

function appendChatBubble(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function simulateAiResponse(query) {
    const chatBox = document.getElementById("chat-box");
    
    // Add typing indicator
    const typing = document.createElement("div");
    typing.className = "chat-bubble ai";
    typing.id = "chat-typing";
    typing.textContent = "Escrevendo...";
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Analyze question
    let responseText = "Entendi sua dúvida. Como assistente inteligente de Rio Largo, posso lhe informar que você pode acompanhar seus protocolos clicando na aba Perfil ou resolver pendências diretamente nos menus principais.";
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("iptu") || lowerQuery.includes("pagar")) {
        responseText = "Para pagar seu IPTU, vá na aba Tributos, clique em cota única para copiar a chave PIX ou digite os dados do cartão de crédito.";
    } else if (lowerQuery.includes("medico") || lowerQuery.includes("consulta") || lowerQuery.includes("saude")) {
        responseText = "Você tem uma consulta agendada para Amanhã às 14:30 na UBS Centro. Para agendar novas, use a seção de Saúde na Home.";
    } else if (lowerQuery.includes("obras") || lowerQuery.includes("bairro") || lowerQuery.includes("centro")) {
        responseText = "No Centro, temos a obra da 'Construção da Praça Central' que está com 80% de andamento e entrega estimada para o dia 12/08/2026.";
    } else if (lowerQuery.includes("vacina")) {
        responseText = "A vacinação contra a Gripe e COVID-19 está disponível na UBS Centro para a sua faixa etária. Não esqueça de levar o seu cartão do SUS.";
    }
    
    setTimeout(() => {
        typing.remove();
        appendChatBubble(responseText, "ai");
        logDashboardActivity(`Cidadão Gustavo interagiu com a IA Municipal ("${query.substring(0, 20)}...")`);
    }, 1200);
}

// ==========================================
// COMUNIDADE FEED INTERACTIONS
// ==========================================

function toggleLike() {
    const btn = document.getElementById("news-like-btn");
    const counter = document.getElementById("news-like-count");
    let currentVal = parseInt(counter.textContent);
    
    btn.classList.toggle("active");
    if (btn.classList.contains("active")) {
        currentVal++;
        btn.style.color = "var(--accent-red)";
        showToast("Obrigado pelo seu feedback positivo!");
        logDashboardActivity("Gustavo curtiu a publicação sobre a revitalização da Praça Central");
    } else {
        currentVal--;
        btn.style.color = "var(--text-secondary)";
    }
    counter.textContent = currentVal;
}

// ==========================================
// SATISFACTION EVALUATION SYSTEM (UBER STYLE)
// ==========================================

let activeRatingValue = 0;

function showSatisfactionModal() {
    document.getElementById("modal-satisfaction").style.display = "flex";
}

function rateService(stars) {
    activeRatingValue = stars;
    
    // Highlight stars
    for (let i = 1; i <= 5; i++) {
        const starBtn = document.getElementById(`star-${i}`);
        if (i <= stars) {
            starBtn.classList.add("active");
        } else {
            starBtn.classList.remove("active");
        }
    }
}

function submitServiceRating() {
    if (activeRatingValue === 0) {
        showToast("Por favor, selecione uma nota de 1 a 5 estrelas.");
        return;
    }
    
    const comment = document.getElementById("txt-rating-comment").value.trim();
    
    showToast("Enviando avaliação...");
    
    setTimeout(() => {
        // Hide rating card & trigger
        document.getElementById("modal-satisfaction").style.display = "none";
        document.getElementById("btn-satisfaction-trigger").style.display = "none";
        
        // Recalculate NPS / Dash Metrics
        // 5 stars = promoter, 1-3 = detractor
        if (activeRatingValue >= 4) {
            state.dashboard.nps = Math.min(100, state.dashboard.nps + 1);
            state.dashboard.satisfactionInfra = Math.min(10, state.dashboard.satisfactionInfra + 0.2);
        } else {
            state.dashboard.nps = Math.max(0, state.dashboard.nps - 2);
            state.dashboard.satisfactionInfra = Math.max(0, state.dashboard.satisfactionInfra - 0.4);
        }
        
        // Update Dashboard Elements
        document.getElementById("val-nps").textContent = state.dashboard.nps;
        document.getElementById("lbl-sec-val-infra").textContent = `${state.dashboard.satisfactionInfra.toFixed(1)} / 10`;
        document.getElementById("fill-sec-infra").style.width = `${state.dashboard.satisfactionInfra * 10}%`;
        
        // Add points
        state.user.citizenshipPoints += 30;
        updatePointsDisplay();
        
        // Log telemetry
        const commentText = comment ? ` - "${comment}"` : "";
        logDashboardActivity(`Avaliação recebida: Cidadão avaliou Infraestrutura com ${activeRatingValue} estrelas${commentText}`);
        
        // Clean form
        rateService(0);
        document.getElementById("txt-rating-comment").value = "";
        
        showToast("Avaliação registrada! Obrigado por colaborar.");
        
        // AI congratulates on NPS change
        document.getElementById("dashboard-ai-rec").innerHTML = `
            <strong>IA Alerta:</strong> NPS atualizado para <strong>${state.dashboard.nps}</strong> após a última avaliação da Infraestrutura. Ações de zeladoria continuam bem avaliadas no Centro.
        `;
    }, 1000);
}

function updatePointsDisplay() {
    document.getElementById("profile-citizenship-pts").textContent = `${state.user.citizenshipPoints} pts`;
}
