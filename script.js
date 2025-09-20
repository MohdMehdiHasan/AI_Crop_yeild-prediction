// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ojdhvdqquvfbzakwezbd.supabase.co'; // REPLACE WITH YOUR ACTUAL SUPABASE URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZGh2ZHFxdXZmYnpha3dlemJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTk1NjgsImV4cCI6MjA3MzkzNTU2OH0.lK0cbz1beuQDOdQqMtncCATiL1riz1exMNzLSbJMg0M'; // REPLACE WITH YOUR ACTUAL ANON KEY
const apiKey = 'D3ff562b18507ab3ea6dc77177760a3f'; // Your OpenWeatherMap Key

let supabase; 
let userLocation = { lat: null, lon: null, name: '' };
let currentLang = 'en';
let currentUser = '';       // Stores the full name for display
let currentUserId = '';     // Stores the Phone Number as the unique identifier

const soilNpkDefaults = {
    "Alluvial": { N: 75, P: 20, K: 150 },
    "Black": { N: 40, P: 30, K: 200 },
    "Red": { N: 60, P: 40, K: 50 },
    "": { N: '', P: '', K: ''}
};

const translations = {
    en: {
        appName: "Krishi Mitra", selectLanguage: "Select Your Language", welcomeToApp: "Welcome to Krishi Mitra", getStarted: "Enter your details to get started", fullNamePlaceholder: "Full Name", phonePlaceholder: "Phone Number (e.g., 9876543210)", allowLocation: "📍 Allow Location Access", loginBtn: "Login", signUpBtn: "Sign Up", signInPrompt: "Sign In with your Phone Number", signUpPrompt: "Create a New Account", newAccountPrompt: "New user? ", haveAccountPrompt: "Already have an account? ", locationNeeded: "Location is needed for weather prediction.",
        welcomeUser: "Welcome, {name}! 👋", myFarms: "My Farms", addFarmBtn: "+ Add New Farm", deleteBtn: "Delete", confirmDelete: "Are you sure you want to delete this farm?", logoutBtn: "Logout",
        addFarmTitle: "Add New Farm", farmDetails: "Farm Details", farmNameLabel: "Farm Name", farmNamePlaceholder: "My Rabi Crop Farm", sowingDateLabel: "Date of Sowing",
        cropDetails: "Crop Details", soilTypeLabel: "Soil Type", landAreaLabel: "Land Area (in acres)", predictBtn: "Predict Yield",
        statusReport: "📈 Current Status Report", predictedYield: "Predicted Yield", issues: "⚠️ Identified Issues", issueNitrogen: "Nitrogen level is low - may reduce productivity by 15%", issueHumidity: "High humidity detected - moderate fungal risk",
        recommendations: "💡 Optimization Recommendations", recUreaTitle: "Add 10kg Urea", recUreaDesc: "Apply nitrogen-rich fertilizer to boost crop growth.", recUreaYield: "✅ Yield may increase by +12%",
        recIrrigateTitle: "Irrigate every 3 days", recIrrigateDesc: "Regular watering schedule to reduce plant stress.", recIrrigateYield: "✅ Reduce stress, +10% yield",
        recNeemTitle: "Spray neem oil", recNeemDesc: "Organic pesticide to prevent fungal infections.", recNeemYield: "✅ Prevent fungal loss, +8% saved",
        backToDashboard: "Back to Dashboard", noFarms: "No farms added yet. Click 'Add New Farm' to get started!", reportFor: "Report for:",
        soilOptions: { "": "Select soil type", "Alluvial": "Alluvial Soil", "Black": "Black Soil", "Red": "Red Soil" },
        cropOptions: { "": "Select crop", "Wheat": "Wheat", "Rice": "Rice", "Sugarcane": "Sugarcane" }
    },
    hi: {
        appName: "कृषि मित्र", selectLanguage: "अपनी भाषा चुनें", welcomeToApp: "कृषि मित्र में आपका स्वागत है", getStarted: "शुरू करने के लिए अपना विवरण दर्ज करें", fullNamePlaceholder: "पूरा नाम", phonePlaceholder: "फ़ोन नंबर (उदाहरण: 9876543210)", allowLocation: "📍 स्थान की अनुमति दें", loginBtn: "लॉग इन करें", signUpBtn: "साइन अप करें", signInPrompt: "अपने फ़ोन नंबर से लॉग इन करें", signUpPrompt: "एक नया खाता बनाएं", newAccountPrompt: "नए उपयोगकर्ता? ", haveAccountPrompt: "पहले से ही एक खाता है? ", locationNeeded: "मौसम की भविष्यवाणी के लिए स्थान की आवश्यकता है।",
        welcomeUser: "नमस्ते, {name}! 👋", myFarms: "मेरे खेत", addFarmBtn: "+ नया खेत जोड़ें", deleteBtn: "हटाएं", confirmDelete: "क्या आप वाकई इस खेत को हटाना चाहते हैं?", logoutBtn: "लॉग आउट",
        addFarmTitle: "नया खेत जोड़ें", farmDetails: "खेत का विवरण", farmNameLabel: "खेत का नाम", farmNamePlaceholder: "मेरा रबी फसल का खेत", sowingDateLabel: "बुवाई की तारीख",
        cropDetails: "फसल का विवरण", soilTypeLabel: "मिट्टी का प्रकार", landAreaLabel: "भूमि क्षेत्र (एकड़ में)", predictBtn: "उपज की भविष्यवाणी करें",
        statusReport: "📈 वर्तमान स्थिति रिपोर्ट", predictedYield: "अनुमानित उपज", issues: "⚠️ पहचाने गए मुद्दे", issueNitrogen: "नाइट्रोजन का स्तर कम है - उत्पादकता 15% तक कम हो सकती है", issueHumidity: "उच्च आर्द्रता का पता चला - फंगल का मध्यम जोखिम",
        recommendations: "💡 अनुकूलन सिफारिशें", recUreaTitle: "10 किलो यूरिया डालें", recUreaDesc: "फसल की वृद्धि को बढ़ावा देने के लिए नाइट्रोजन युक्त उर्वरक डालें।", recUreaYield: "✅ उपज 12% तक बढ़ सकती है",
        recIrrigateTitle: "हर 3 दिन में सिंचाई करें", recIrrigateDesc: "पौधों का तनाव कम करने के लिए नियमित रूप से पानी दें।", recIrrigateYield: "✅ तनाव कम करें, +10% उपज",
        recNeemTitle: "नीम तेल का छिड़काव करें", recNeemDesc: "फंगल संक्रमण को रोकने के लिए जैविक कीटनाशक।", recNeemYield: "✅ फंगल नुकसान रोकें, +8% बचत",
        backToDashboard: "डैशबोर्ड पर वापस जाएं", noFarms: "अभी तक कोई खेत नहीं जोड़ा गया है। शुरू करने के लिए 'नया खेत जोड़ें' पर क्लिक करें!", reportFor: "रिपोर्ट:",
        soilOptions: { "": "मिट्टी का प्रकार चुनें", "Alluvial": "जलोढ़ मिट्टी", "Black": "काली मिट्टी", "Red": "लाल मिट्टी" },
        cropOptions: { "": "फसल चुनें", "Wheat": "गेहूँ", "Rice": "चावल", "Sugarcane": "गन्ना" }
    },
    mr: { appName: "कृषी मित्र", selectLanguage: "तुमची भाषा निवडा", welcomeToApp: "कृषी मित्र मध्ये आपले स्वागत आहे", getStarted: "सुरु करण्यासाठी आपले तपशील प्रविष्ट करा", fullNamePlaceholder: "पूर्ण नाव", phonePlaceholder: "फोन नंबर (उदा: ९८७६५४३२१०)", allowLocation: "📍 स्थान परवानगी द्या", loginBtn: "लॉग इन करा", signUpBtn: "साइन अप करा", signInPrompt: "तुमच्या फोन नंबरने लॉग इन करा", signUpPrompt: "एक नवीन खाते तयार करा", newAccountPrompt: "नवीन वापरकर्ता? ", haveAccountPrompt: "आधीच खाते आहे? ", locationNeeded: "हवामान अंदाजासाठी स्थानाची आवश्यकता आहे.", welcomeUser: "नमस्कार, {name}! 👋", myFarms: "माझी शेती", addFarmBtn: "+ नवीन शेत जोडा", deleteBtn: "काढा", confirmDelete: "तुम्हाला खात्री आहे की हे शेत काढायचे आहे?", logoutBtn: "लॉग आउट", addFarmTitle: "नवीन शेत जोडा", farmDetails: "शेतीचे तपशील", farmNameLabel: "शेताचे नाव", farmNamePlaceholder: "माझे रब्बी पीक शेत", sowingDateLabel: "पेरणीची तारीख", cropDetails: "पिकाचे तपशील", soilTypeLabel: "मातीचा प्रकार", landAreaLabel: "जमीन क्षेत्र (एकर मध्ये)", predictBtn: "उत्पादनाचा अंदाज लावा", statusReport: "📈 सद्यस्थिती अहवाल", predictedYield: "अपेक्षित उत्पादन", issues: "⚠️ ओळखलेल्या समस्या", issueNitrogen: "नायट्रोजनची पातळी कमी आहे - उत्पादकता १५% ने कमी होऊ शकते", issueHumidity: "उच्च आर्द्रता आढळली - बुरशीजन्य रोगाचा मध्यम धोका", recommendations: "💡 ऑप्टिमायझेशन शिफारसी", recUreaTitle: "१० किलो युरिया टाका", recUreaDesc: "पिकाच्या वाढीसाठी नायट्रोजनयुक्त खत वापरा.", recUreaYield: "✅ उत्पादन १२% ने वाढू शकते", recIrrigateTitle: "दर ३ दिवसांनी सिंचन करा", recIrrigateDesc: "वनस्पतींवरील ताण कमी करण्यासाठी नियमित पाणी द्या.", recIrrigateYield: "✅ ताण कमी करा, +१०% उत्पादन", recNeemTitle: "कडुलिंबाच्या तेलाची फवारणी करा", recNeemDesc: "बुरशीजन्य संसर्ग टाळण्यासाठी सेंद्रिय कीटकनाशक.", recNeemYield: "✅ बुरशीचे नुकसान टाळा, +८% बचत", backToDashboard: "डॅशबोर्डवर परत जा", noFarms: "अद्याप कोणतीही शेती जोडलेली नाही.", reportFor: "यासाठी अहवाल:", soilOptions: { "": "मातीचा प्रकार निवडा", "Alluvial": "गाळाची माती", "Black": "काळी माती", "Red": "लाल माती" }, cropOptions: { "": "पीक निवडा", "Wheat": "गहू", "Rice": "तांदूळ", "Sugarcane": "ऊस" } },
    ta: { appName: "கிருஷி மித்ரா", selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்", welcomeToApp: "கிருஷி மித்ராவிற்கு வரவேற்கிறோம்", getStarted: "தொடங்குவதற்கு உங்கள் விவரங்களை உள்ளிடவும்", fullNamePlaceholder: "முழு பெயர்", phonePlaceholder: "தொலைபேசி எண் (எ.கா. 9876543210)", allowLocation: "📍 இருப்பிடத்தை அனுமதிக்கவும்", loginBtn: "உள்நுழையவும்", signUpBtn: "பதிவு செய்யவும்", signInPrompt: "உங்கள் தொலைபேசி எண்ணுடன் உள்நுழையவும்", signUpPrompt: "ஒரு புதிய கணக்கை உருவாக்கவும்", newAccountPrompt: "புதிய பயனர்? ", haveAccountPrompt: "ஏற்கனவே ஒரு கணக்கு உள்ளதா? ", locationNeeded: "காலநிலை கணிப்புக்கு இருப்பிடம் தேவை.", welcomeUser: "வணக்கம், {name}! 👋", myFarms: "என் பண்ணைகள்", addFarmBtn: "+ புதிய பண்ணையைச் சேர்க்கவும்", deleteBtn: "நீக்கு", confirmDelete: "இந்த பண்ணையை நீக்க விரும்புகிறீர்களா?", logoutBtn: "வெளியேறு", addFarmTitle: "புதிய பண்ணையைச் சேர்க்கவும்", farmDetails: "பண்ணை விவரங்கள்", farmNameLabel: "பண்ணையின் பெயர்", farmNamePlaceholder: "எனது ரபி பயிர் பண்ணை", sowingDateLabel: "விதைக்கும் தேதி", cropDetails: "பயிர் விவரங்கள்", soilTypeLabel: "மண் வகை", landAreaLabel: "நிலப் பகுதி (ஏக்கரில்)", predictBtn: "விளைச்சலைக் கணிக்கவும்", statusReport: "📈 தற்போதைய நிலை அறிக்கை", predictedYield: "கணிக்கப்பட்ட விளைச்சல்", issues: "⚠️ அடையாளம் காணப்பட்ட சிக்கல்கள்", issueNitrogen: "நைட்ரஜன் அளவு குறைவாக உள்ளது - உற்பத்தித்திறனை 15% குறைக்கலாம்", issueHumidity: "அதிக ஈரப்பதம் கண்டறியப்பட்டது - மிதமான பூஞ்சை ஆபத்து", recommendations: "💡 மேம்படுத்தல் பரிந்துரைகள்", recUreaTitle: "10 கிலோ யூரியா சேர்க்கவும்", recUreaDesc: "பயிர் வளர்ச்சியை அதிகரிக்க நைட்ரஜன் நிறைந்த உரத்தைப் பயன்படுத்துங்கள்.", recUreaYield: "✅ விளைச்சல் 12% வரை அதிகரிக்கலாம்", recIrrigateTitle: "ஒவ்வொரு 3 நாட்களுக்கும் நீர்ப்பாசனம் செய்யவும்", recIrrigateDesc: "தாவர அழுத்தத்தைக் குறைக்க வழக்கமான நீர்ப்பாசன அட்டவணை.", recIrrigateYield: "✅ மன அழுத்தத்தைக் குறைத்தல், +10% விளைச்சல்", recNeemTitle: "வேப்ப எண்ணெயைத் தெளிக்கவும்", recNeemDesc: "பூஞ்சைத் தொற்றுகளைத் தடுக்க கரிமப் பூச்சிக்கொல்லி.", recNeemYield: "✅ பூஞ்சை இழப்பைத் தடுக்கவும், +8% சேமிப்பு", backToDashboard: "டாஷ்போர்டுக்குத் திரும்பு", noFarms: "இன்னும் பண்ணைகள் சேர்க்கப்படவில்லை.", reportFor: "அறிக்கை:", soilOptions: { "": "மண் வகையைத் தேர்ந்தெடுக்கவும்", "Alluvial": "வண்டல் மண்", "Black": "கரிசல் மண்", "Red": "செம்மண்" }, cropOptions: { "": "பயிரைத் தேர்ந்தெடுக்கவும்", "Wheat": "கோதுமை", "Rice": "அரிசி", "Sugarcane": "கரும்பு" } },
    te: { appName: "కృషి మిత్ర", selectLanguage: "మీ భాషను ఎంచుకోండి", welcomeToApp: "కృషి మిత్రకు స్వాగతం", getStarted: "ప్రారంభించడానికి మీ వివరాలను నమోదు చేయండి", fullNamePlaceholder: "పూర్తి పేరు", phonePlaceholder: "ఫోన్ నంబర్ (ఉదా: 9876543210)", allowLocation: "📍 స్థానాన్ని అనుమతించండి", loginBtn: "లాగిన్ అవ్వండి", signUpBtn: "సైన్ అప్ చేయండి", signInPrompt: "మీ ఫోన్ నంబర్‌తో లాగిన్ అవ్వండి", signUpPrompt: "కొత్త ఖాతాను సృష్టించండి", newAccountPrompt: "కొత్త వాడుకరి? ", haveAccountPrompt: "ఇప్పటికే ఖాతా ఉందా? ", locationNeeded: "దిగుబడి అంచనా కోసం స్థానం అవసరం.", welcomeUser: "నమస్కారం, {name}! 👋", myFarms: "నా పొలాలు", addFarmBtn: "+ కొత్త పొలాన్ని జోడించండి", deleteBtn: "తొలగించు", confirmDelete: "మీరు ఈ పొలాన్ని తొలగించాలనుకుంటున్నారా?", logoutBtn: "లాగ్ అవుట్", addFarmTitle: "కొత్త పొలాన్ని జోడించండి", farmDetails: "పొలం వివరాలు", farmNameLabel: "పొలం పేరు", farmNamePlaceholder: "నా రబీ పంట పొలం", sowingDateLabel: "విత్తే తేదీ", cropDetails: "పంట వివరాలు", soilTypeLabel: "నేల రకం", landAreaLabel: "భూమి విస్తీర్ణం (ఎకరాలలో)", predictBtn: "దిగుబడిని అంచనా వేయండి", statusReport: "📈 ప్రస్తుత స్థితి నివేదిక", predictedYield: "అంచనా వేసిన దిగుబడి", issues: "⚠️ గుర్తించిన సమస్యలు", issueNitrogen: "నత్రజని స్థాయి తక్కువగా ఉంది - ఉత్పాదకత 15% తగ్గుతుంది", issueHumidity: "అధిక తేమ కనుగొనబడింది - మధ్యస్థ శిలీంధ్ర ప్రమాదం", recommendations: "💡 ఆప్టిమైజేషన్ సిఫార్సులు", recUreaTitle: "10 కిలోల యూరియా జోడించండి", recUreaDesc: "పంటల വളർച്ചను పెంచడానికి నత్రజని అధికంగా ఉండే ఎరువును వేయండి.", recUreaYield: "✅ దిగుబడి 12% వరకు పెరగవచ్చు",
        recIrrigateTitle: "ప్రతి 3 రోజులకు నీరు పెట్టండి", recIrrigateDesc: "మొక్కల ఒత్తిడిని తగ్గించడానికి క్రమమైన నీటిపారుదల షెడ్యూల్.", recIrrigateYield: "✅ ఒత్తిడిని తగ్గించండి, +10% దిగుబడి", recNeemTitle: "వేప నూనెను పిచికారీ చేయండి", recNeemDesc: "శిలీంధ్ర సంక్రమణలను నివారించడానికి సేంద్రీయ పురుగుమందు.", recNeemYield: "✅ శిలీంధ్ర నష్టాన్ని నివారించండి, +8% ఆదా", backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", noFarms: "ఇంకా పొలాలు జోడించబడలేదు.", reportFor: "కోసం నివేదిక:", soilOptions: { "": "నేల రకాన్ని ఎంచుకోండి", "Alluvial": "ఒండ్రు నేల", "Black": "నల్ల నేల", "Red": "ఎర్ర నేల" }, cropOptions: { "": "పంటను ఎంచుకోండి", "Wheat": "గోధుమ", "Rice": "బియ్యం", "Sugarcane": "చెరకు" } }
};

// --- CORE FUNCTIONS ---

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        const translation = translations[lang]?.[key] || translations['en'][key];
        if (el.placeholder !== undefined) { el.placeholder = translation; } 
        else { el.innerText = translation; }
    });
    const langOptions = translations[lang] || translations['en'];
    
    if (document.getElementById('soil-type')) {
        updateDropdown('soil-type', langOptions.soilOptions);
    }
    if (document.getElementById('crop-type')) {
        updateDropdown('crop-type', langOptions.cropOptions);
    }
}

function updateDropdown(selectId, options) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return; 

    selectElement.innerHTML = '';
    for (const value in options) {
        const optionElement = document.createElement('option');
        optionElement.value = value;
        optionElement.innerText = options[value];
        selectElement.appendChild(optionElement);
    }
}

function setLanguageAndScreen(lang, screenId) { 
    setLanguage(lang); 
    showScreen(screenId); 
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function toggleForm(formId) {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById(formId).classList.add('active');
}

function autofillNpk() {
    const soilType = document.getElementById('soil-type').value;
    const npk = soilNpkDefaults[soilType];
    document.getElementById('npk-n').value = npk.N;
    document.getElementById('npk-p').value = npk.P;
    document.getElementById('npk-k').value = npk.K;
}

// --- LOCATION FUNCTIONS ---

function getLocation() {
    const locationBoxLogin = document.getElementById('location-box');
    const locationBoxSignup = document.getElementById('signup-location-box');
    
    if (navigator.geolocation) {
        locationBoxLogin.innerHTML = 'Detecting Location...';
        locationBoxSignup.innerHTML = 'Detecting Location...';
        
        navigator.geolocation.getCurrentPosition(fetchLocationName, handleLocationError);
    } else { alert("Geolocation is not supported by this browser."); }
}

async function fetchLocationName(position) {
    userLocation.lat = position.coords.latitude; 
    userLocation.lon = position.coords.longitude;
    try {
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${userLocation.lat}&lon=${userLocation.lon}&limit=1&appid=${apiKey}`;
        const response = await fetch(geoApiUrl);
        if (!response.ok) throw new Error(`Network error`);
        const data = await response.json();
        
        if (data && data.length > 0) { 
            userLocation.name = `${data[0].name}, ${data[0].state || data[0].country}`; 
        } else { 
            throw new Error('Could not find a location name.'); 
        }
        
        // Update both login and signup screens
        const successMessage = `<span style="color: var(--primary-green);">Location detected!</span>`;
        document.getElementById('location-box').innerHTML = `📍 ${userLocation.name}`;
        document.getElementById('location-display').innerHTML = successMessage;
        
        document.getElementById('signup-location-box').innerHTML = `📍 ${userLocation.name}`;
        document.getElementById('signup-location-display').innerHTML = successMessage;


    } catch (error) {
        console.error("Error fetching location name:", error);
        const failMessage = '📍 Location Access Failed';
        const errorMessage = `<span style="color: var(--danger-red);">Error: ${error.message.substring(0, 30)}...</span>`;
        
        document.getElementById('location-box').innerHTML = failMessage;
        document.getElementById('location-display').innerHTML = errorMessage;
        
        document.getElementById('signup-location-box').innerHTML = failMessage;
        document.getElementById('signup-location-display').innerHTML = errorMessage;
    }
}

function handleLocationError(error) { 
    alert(`Location Error: ${error.message}`); 
    document.getElementById('location-display').innerHTML = `<span style="color: var(--danger-red);">Permission Denied.</span>`;
    document.getElementById('signup-location-display').innerHTML = `<span style="color: var(--danger-red);">Permission Denied.</span>`;
}

// --- AUTHENTICATION HANDLERS (Manual Login/Signup with Phone) ---

async function handleLogin() {
    const phoneNumber = document.getElementById('login-phone').value;

    if (!phoneNumber) {
        alert('Please enter your phone number.'); return;
    }
    if (!userLocation.name) { 
        alert('Please allow location access and wait for detection.'); return;
    }
    
    // Query the 'profiles' table using the phone number
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone_number, latitude, longitude, location_name')
        .eq('phone_number', phoneNumber)
        .single();

    if (profileError) {
        if (profileError.code === 'PGRST116') { // Error code for 'no rows found'
            alert('Login failed: Account not found. Please sign up first.');
        } else {
            console.error('Login Query Error:', profileError.message);
            alert(`Login failed: ${profileError.message}`);
        }
        return;
    }

    // Set global user details
    currentUserId = profile.phone_number; 
    currentUser = profile.full_name;
    userLocation.lat = profile.latitude; 
    userLocation.lon = profile.longitude;
    userLocation.name = profile.location_name;

    const welcomeTemplate = translations[currentLang]?.welcomeUser || translations['en'].welcomeUser;
    document.getElementById('welcome-message').innerText = welcomeTemplate.replace('{name}', currentUser);
    document.getElementById('dashboard-location').innerText = `📍 ${userLocation.name}`;
    renderFarms();
    showScreen('dashboard-screen');
}

async function handleSignUp() {
    const fullName = document.getElementById('signup-full-name').value;
    const phoneNumber = document.getElementById('signup-phone').value;
    
    if (!fullName || !phoneNumber) {
         alert('Please fill in your full name and phone number.'); return;
    }
    if (!userLocation.name) { 
        alert('Please allow location access and wait for detection.'); return;
    }
    
    // Check if phone number already exists
    const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('phone_number', phoneNumber);

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check Phone Error:', checkError.message);
        alert(`Sign Up failed: ${checkError.message}`);
        return;
    }
    if (existingUser && existingUser.length > 0) {
        alert('Account with this phone number already exists. Please login.');
        return;
    }

    // Save user profile data to the 'public.profiles' table
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
            phone_number: phoneNumber, 
            full_name: fullName, 
            location_name: userLocation.name,
            latitude: userLocation.lat,
            longitude: userLocation.lon
        });

    if (profileError) {
        console.error('Profile Save Error:', profileError.message);
        alert('Account creation failed. Please try again.');
        return;
    }
    
    alert("Account created successfully! Please log in.");
    toggleForm('login-form');
}

function logout() { 
    currentUser = ''; 
    currentUserId = ''; 
    // Simply reload to reset state and return to the language/login screen
    location.reload(); 
}

// --- FARM DATA HANDLERS ---

async function saveAndPredict() {
    const farmName = document.getElementById('farm-name').value;
    const sowingDate = document.getElementById('sowing-date').value;
    const cropType = document.getElementById('crop-type').value;
    const landArea = document.getElementById('land-area').value;
    const soilType = document.getElementById('soil-type').value;
    const npkN = document.getElementById('npk-n').value;
    const npkP = document.getElementById('npk-p').value;
    const npkK = document.getElementById('npk-k').value;

    if (!farmName || !cropType || !landArea || !sowingDate || !soilType) {
        alert('Please fill in all farm details.'); return;
    }
    if (!currentUserId) {
        alert('User not logged in. Please login first.'); return;
    }

    const newFarmData = { 
        user_id: currentUserId, // Phone Number
        farm_name: farmName, 
        sowing_date: sowingDate, 
        crop_type: cropType, 
        land_area: parseFloat(landArea),
        soil_type: soilType,
        npk_n: parseFloat(npkN),
        npk_p: parseFloat(npkP),
        npk_k: parseFloat(npkK),
        farm_latitude: userLocation.lat,
        farm_longitude: userLocation.lon
    };

    const { data, error } = await supabase
        .from('farms')
        .insert([newFarmData])
        .select(); 

    if (error) {
        console.error('Supabase Save Farm Error:', error.message);
        alert('Failed to save farm. Please try again.');
        return;
    }
    
    const savedFarm = data[0]; 
    viewFarmReport(savedFarm); 
}

async function renderFarms() {
    const farmListContainer = document.getElementById('farm-list');
    farmListContainer.innerHTML = '';
    const T = translations[currentLang] || translations['en'];

    if (!currentUserId) return;

    const { data: farms, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', currentUserId)
        .order('id', { ascending: false });

    if (error) {
        console.error('Supabase Fetch Farms Error:', error.message);
        farmListContainer.innerHTML = `<div class="no-farms"><p>Error fetching farms.</p></div>`;
        return;
    }

    if (farms.length === 0) {
        farmListContainer.innerHTML = `<div class="no-farms"><p>${T.noFarms}</p></div>`;
    } else {
        farms.forEach(farm => {
            const farmCard = document.createElement('div');
            farmCard.className = 'farm-card';
            farmCard.onclick = () => viewFarmReport(farm); 
            const deleteBtnText = T.deleteBtn;
            farmCard.innerHTML = `
                <div class="farm-card-header">
                    <h4>${farm.farm_name}</h4>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteFarm(${farm.id});">${deleteBtnText}</button>
                </div>
                <p>Crop: ${farm.crop_type} | Area: ${farm.land_area} acres</p>
                <p>Sowing Date: ${farm.sowing_date}</p>`;
            farmListContainer.appendChild(farmCard);
        });
    }
}

function viewFarmReport(farm) {
    if (!farm) return;

    const reportScreen = document.getElementById('report-screen');
    const T = translations[currentLang] || translations['en'];
    
    // Simple example logic for yield prediction based on crop type
    const predictedYield = farm.crop_type === 'Rice' ? '35 quintal/acre' : '25 quintal/acre';

    reportScreen.innerHTML = `
        <div class="report-section">
            <h3 data-translate-key="statusReport">${T.statusReport}</h3>
            <p data-translate-key="reportFor" style="font-weight: 500;">${T.reportFor} <span style="color: var(--primary-green);">${farm.farm_name}</span></p>
            <hr style="margin: 10px 0;">
            <p data-translate-key="predictedYield">${T.predictedYield}</p>
            <h2 class="predicted-yield">${predictedYield}</h2>
        </div>
        
        <div class="report-section">
            <h3 data-translate-key="issues">${T.issues}</h3>
            <div class="issue">${T.issueNitrogen}</div>
            <div class="issue">${T.issueHumidity}</div>
        </div>

        <div class="report-section">
            <h3 data-translate-key="recommendations">${T.recommendations}</h3>
            <div class="recommendation-cards">
                <div class="rec-card">
                    <h4>${T.recUreaTitle}</h4>
                    <p>${T.recUreaDesc}</p>
                    <span class="yield-increase">${T.recUreaYield}</span>
                </div>
                <div class="rec-card">
                    <h4>${T.recIrrigateTitle}</h4>
                    <p>${T.recIrrigateDesc}</p>
                    <span class="yield-increase">${T.recIrrigateYield}</span>
                </div>
                <div class="rec-card">
                    <h4>${T.recNeemTitle}</h4>
                    <p>${T.recNeemDesc}</p>
                    <span class="yield-increase">${T.recNeemYield}</span>
                </div>
            </div>
        </div>
        
        <button class="btn" onclick="showScreen('dashboard-screen')" data-translate-key="backToDashboard">${T.backToDashboard}</button>
    `;
    showScreen('report-screen');
}

async function deleteFarm(farmId) {
    const confirmText = translations[currentLang].confirmDelete;
    if (confirm(confirmText)) {
        const { error } = await supabase
            .from('farms')
            .delete()
            .eq('id', farmId);

        if (error) {
            console.error('Supabase Delete Farm Error:', error.message);
            alert('Failed to delete farm. Please try again.');
            return;
        }
        renderFarms();
    }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("FATAL ERROR: Supabase library not loaded.");
    }

    // 2. Set Language and Initial Screen
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    showScreen('language-screen');
    
    // 3. Set up event listeners for inputs
    const soilTypeElement = document.getElementById('soil-type');
    if (soilTypeElement) {
         soilTypeElement.addEventListener('change', autofillNpk);
    }
    // Location listeners are already set in the HTML with onclick="getLocation()"
});