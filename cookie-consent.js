(function() {
    // Função para pegar os dados do script
    function getScriptParams() {
        const script = document.currentScript || document.querySelector('script[src*="cookie-consent.js"]');
        return {
            gtmId: script ? script.getAttribute('data-gtm-id') : null,
            gaId: script ? script.getAttribute('data-ga-id') : null,
            gaIntegrated: script ? script.getAttribute('data-ga-integrated') === 'true' : false
        };
    }

    // Função para aplicar estilos ao banner
    function applyStyles(element, styles) {
        for (let property in styles) {
            element.style[property] = styles[property];
        }
    }

    // Função para exibir o banner de consentimento de cookies
    function showCookieConsentBanner() {
        const consentBanner = document.createElement('div');
        consentBanner.id = 'cookie-consent-banner';
        consentBanner.innerHTML = `
            <div>
                <p>We use cookies to enhance your experience and for analytical purposes. To manage your preferences, select the options below:</p>
                <div>
                    <label>
                        <input type="checkbox" id="necessary-cookies" checked disabled> 
                        <strong>Necessary Cookies</strong> - Essential for the website to function properly.
                    </label>
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="preference-cookies"> 
                        <strong>Preference Cookies</strong> - Used to remember your preferences and settings.
                    </label>
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="statistics-cookies"> 
                        <strong>Statistics Cookies</strong> - Used for statistical purposes and to improve our services.
                    </label>
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="marketing-cookies"> 
                        <strong>Marketing Cookies</strong> - Used to provide personalized ads.
                    </label>
                </div>
                <div>
                    <button id="allow-all">Allow All</button>
                    <button id="allow-selected">Allow Selected</button>
                    <button id="deny-all">Deny All</button>
                </div>
            </div>
        `;
        document.body.appendChild(consentBanner);

        // Aplicando estilos ao banner
        applyStyles(consentBanner, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            zIndex: '10000',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            maxWidth: '90%',
            boxSizing: 'border-box'
        });

        document.getElementById('allow-all').addEventListener('click', function() {
            setCookieConsent(true, true, true, true);
            updateConsentSettings(true, true, true, true);
            loadGTM();
            loadAnalytics();
            consentBanner.style.display = 'none';
        });

        document.getElementById('allow-selected').addEventListener('click', function() {
            const preferenceConsent = document.getElementById('preference-cookies').checked;
            const statisticsConsent = document.getElementById('statistics-cookies').checked;
            const marketingConsent = document.getElementById('marketing-cookies').checked;
            setCookieConsent(true, preferenceConsent, statisticsConsent, marketingConsent);
            updateConsentSettings(true, preferenceConsent, statisticsConsent, marketingConsent);
            if (statisticsConsent || marketingConsent) {
                loadGTM();
                if (!params.gaIntegrated && statisticsConsent) {
                    loadAnalytics();
                }
            }
            consentBanner.style.display = 'none';
        });

        document.getElementById('deny-all').addEventListener('click', function() {
            setCookieConsent(false, false, false, false);
            updateConsentSettings(false, false, false, false);
            consentBanner.style.display = 'none';
        });
    }

    // Função para armazenar a escolha do usuário
    function setCookieConsent(necessary, preference, statistics, marketing) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `necessary_cookies=${necessary}; expires=${date.toUTCString()}; path=/`;
        document.cookie = `preference_cookies=${preference}; expires=${date.toUTCString()}; path=/`;
        document.cookie = `statistics_cookies=${statistics}; expires=${date.toUTCString()}; path=/`;
        document.cookie = `marketing_cookies=${marketing}; expires=${date.toUTCString()}; path=/`;
    }

    // Função para atualizar as configurações de consentimento
    function updateConsentSettings(necessary, preference, statistics, marketing) {
        if (typeof gtag === 'function') {
            gtag('consent', 'default', {
                'ad_storage': marketing ? 'granted' : 'denied',
                'analytics_storage': statistics ? 'granted' : 'denied',
                'functionality_storage': preference ? 'granted' : 'denied',
                'personalization_storage': preference ? 'granted' : 'denied'
            });
        }
    }

    // Função para carregar GTM
    function loadGTM() {
        const params = getScriptParams();
        if (params.gtmId) {
            // Carregar GTM
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', params.gtmId);

            // Carregar GTM noscript
            const noscript = document.createElement('noscript');
            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${params.gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            document.body.appendChild(noscript);
        }
    }

    // Função para carregar GA
    function loadAnalytics() {
        const params = getScriptParams();
        if (params.gaId) {
            // Carregar GA
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', params.gaId);

            const gaScript = document.createElement('script');
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${params.gaId}`;
            document.head.appendChild(gaScript);
        }
    }

    // Verifica se o usuário já consentiu com os cookies
    function checkConsent() {
        const cookies = document.cookie.split(';');
        let necessary = false;
        let preference = false;
        let statistics = false;
        let marketing = false;

        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'necessary_cookies') {
                necessary = value === 'true';
            }
            if (name === 'preference_cookies') {
                preference = value === 'true';
            }
            if (name === 'statistics_cookies') {
                statistics = value === 'true';
            }
            if (name === 'marketing_cookies') {
                marketing = value === 'true';
            }
        }
        return { necessary, preference, statistics, marketing };
    }

    // Inicializa o consentimento de cookies
    function initCookieConsent() {
        const { necessary, preference, statistics, marketing } = checkConsent();
        updateConsentSettings(necessary, preference, statistics, marketing);
        if (necessary) {
            if (statistics || marketing) {
                loadGTM();
                if (!params.gaIntegrated && statistics) {
                    loadAnalytics();
                }
            }
        } else {
            showCookieConsentBanner();
        }
    }

    // Inicia o script após o carregamento do DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializa com todos os consentimentos negados
        updateConsentSettings(false, false, false, false);
        loadGTM();
        loadAnalytics();
        initCookieConsent();
    });
})();
