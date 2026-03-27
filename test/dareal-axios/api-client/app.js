document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('request-form');
  const methodSelect = document.getElementById('req-method');
  const urlInput = document.getElementById('req-url');
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const addRowBtns = document.querySelectorAll('.add-row-btn');
  
  const responseLoader = document.getElementById('response-loader');
  const responseContent = document.getElementById('response-content');
  const responseData = document.getElementById('response-data');
  const responseMeta = document.getElementById('response-meta');
  const resStatusCode = document.getElementById('res-status-code');
  const resTimeVal = document.getElementById('res-time-val');
  
  const resBodyContent = document.getElementById('res-body-content');
  const resHeadersContent = document.getElementById('res-headers-content');
  
  // Tab Switching Logic
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Find parent container (either request-bar tabs or response-tabs)
      const container = btn.closest('.tabs').nextElementSibling;
      const allBtns = btn.closest('.tabs').querySelectorAll('.tab-btn');
      const allPanes = container.querySelectorAll('.tab-pane');
      
      allBtns.forEach(b => b.classList.remove('active'));
      allPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Dynamic Key-Value Rows
  addRowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const container = document.getElementById(targetId);
      
      const newRow = document.createElement('div');
      newRow.className = 'key-value-row';
      
      const isHeader = targetId === 'headers-container';
      const keyClass = isHeader ? 'header-key' : 'param-key';
      const valClass = isHeader ? 'header-val' : 'param-val';
      const keyPlaceholder = isHeader ? 'Key (e.g., Content-Type)' : 'Key';
      const valPlaceholder = isHeader ? 'Value (e.g., application/json)' : 'Value';
      
      newRow.innerHTML = `
        <input type="text" class="kv-key ${keyClass}" placeholder="${keyPlaceholder}">
        <input type="text" class="kv-value ${valClass}" placeholder="${valPlaceholder}">
        <button type="button" class="icon-btn remove-row"><i data-lucide="trash-2"></i></button>
      `;
      
      container.appendChild(newRow);
      lucide.createIcons();
    });
  });

  // Remove rows (event delegation)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-row');
    if (btn) {
      const row = btn.closest('.key-value-row');
      const container = row.parentElement;
      if (container.children.length > 1) {
        row.remove();
      } else {
        // Clear instead of remove if it's the last one
        row.querySelector('.kv-key').value = '';
        row.querySelector('.kv-value').value = '';
      }
    }
  });

  // Utility to parse key-value lists
  function getKeyValuePairs(containerId, keyClass, valClass) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.key-value-row');
    const pairs = {};
    let hasData = false;
    
    rows.forEach(row => {
      const key = row.querySelector(`.${keyClass}`).value.trim();
      const val = row.querySelector(`.${valClass}`).value.trim();
      
      if (key) {
        pairs[key] = val;
        hasData = true;
      }
    });
    
    return hasData ? pairs : undefined;
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) return;
    
    const method = methodSelect.value;
    const params = getKeyValuePairs('params-container', 'param-key', 'param-val');
    let headers = getKeyValuePairs('headers-container', 'header-key', 'header-val') || {};
    
    let data;
    const bodyStr = document.getElementById('req-body').value.trim();
    if (bodyStr && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        data = JSON.parse(bodyStr);
        // Auto-add Content-Type header if not present
        if (!headers) headers = {};
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      } catch (err) {
        data = bodyStr; // send as raw string if not valid JSON
      }
    }

    // UI State: Loading
    responseContent.classList.add('hidden');
    responseData.classList.add('hidden');
    responseMeta.classList.add('hidden');
    responseLoader.classList.remove('hidden');
    
    // Default Axios fallback if dareal-axios didn't load properly
    const axiosInstance = window.axios || function() { 
      alert("dareal-axios not found. Make sure index.js is loaded.");
      return Promise.reject(new Error("axios missing"));
    };
    
    const startTime = performance.now();
    let response;
    
    try {
      const reqConfig = {
        url,
        method,
        params,
        headers,
        data,
        responseType: 'text', // Workaround for InvalidStateError when reading xhr.responseText in dareal-axios
        validateStatus: () => true // Resolve all statuses for display
      };
      
      if (typeof axiosInstance === 'function') {
        response = await axiosInstance(reqConfig);
      } else if (typeof axiosInstance.request === 'function') {
        response = await axiosInstance.request(reqConfig);
      } else {
        // As a fallback, try to build a basic request if neither works?
        throw new Error("dareal-axios instance is missing a request method.");
      }

      displayResponse(response, performance.now() - startTime);
    } catch (error) {
      if (error.response) {
        displayResponse(error.response, performance.now() - startTime);
      } else {
        // Network Error or Setup Error
        displayError(error, performance.now() - startTime);
      }
    }
  });

  function displayResponse(res, duration) {
    responseLoader.classList.add('hidden');
    responseData.classList.remove('hidden');
    responseMeta.classList.remove('hidden');
    
    const status = res.status || 0;
    const statusText = res.statusText || 'Unknown';
    let isSuccess = status >= 200 && status < 300;
    
    resStatusCode.textContent = `${status} ${statusText}`;
    resStatusCode.className = `status-badge ${isSuccess ? 'success' : 'error'}`;
    resTimeVal.textContent = Math.round(duration);
    
    // Format headers
    resHeadersContent.innerHTML = '';
    const resHeaders = res.headers && typeof res.headers.toJSON === 'function' ? res.headers.toJSON() : (res.headers || {});
    
    if (Object.keys(resHeaders).length > 0) {
      for (const [key, value] of Object.entries(resHeaders)) {
        resHeadersContent.innerHTML += `
          <div class="header-row">
            <div class="header-name">${key}</div>
            <div class="header-value">${value}</div>
          </div>
        `;
      }
    } else {
      resHeadersContent.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No headers found</div>';
    }
    
    // Format body
    let displayBody = res.data;
    if (typeof displayBody === 'object') {
      try {
        displayBody = JSON.stringify(displayBody, null, 2);
      } catch (e) {
        displayBody = String(displayBody);
      }
    }
    
    resBodyContent.textContent = displayBody || '';
    
    // Re-highlight
    delete resBodyContent.dataset.highlighted;
    hljs.highlightElement(resBodyContent);
  }

  function displayError(error, duration) {
    responseLoader.classList.add('hidden');
    responseData.classList.remove('hidden');
    responseMeta.classList.remove('hidden');
    
    resStatusCode.textContent = error.code || 'Network Error';
    resStatusCode.className = 'status-badge error';
    resTimeVal.textContent = Math.round(duration);
    
    resHeadersContent.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No response headers</div>';
    
    resBodyContent.textContent = error.message || String(error);
    delete resBodyContent.dataset.highlighted;
    hljs.highlightElement(resBodyContent);
  }
});
