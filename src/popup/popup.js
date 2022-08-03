// Buttons
const saveButton = document.getElementById('save-button');

// Inputs
const websiteInput = document.getElementById('website');
const queryInput = document.getElementById('query');
const customValueInput = document.getElementById('custom_value');
const refreshInput = document.getElementById('refresh');
const delayInput = document.getElementById('delay');
const smsUrlInput = document.getElementById('send_sms_url');

// Radio for onclick
const select_type_custom = document.getElementById('custom')
const select_type_simple = document.getElementById('simple')
const sms_true = document.getElementById('sms_true')
const sms_false = document.getElementById('sms_false')

// sections
const customSection = document.querySelector('.custom-selector')
const simpleSection = document.querySelector('.simple-selector')
const smsInputSection = document.querySelector('.send_sms_url')

function reloadPageOnSave() {
  console.log('reloadPageOnSave')
  const shouldReload = window.confirm('Page will reload to apply new settings, click OK to confirm.')

  if (shouldReload) {
    console.log('Reloading!')
    window.location.reload()
  }
}

async function saveWebsiteClick() {
  // Selected radio values
  const onOff = document.querySelector('input[name="turn_on_off"]:checked')
  const query_exists = document.querySelector('input[name="query_exists"]:checked')
  const select_type = document.querySelector('input[name="select_type"]:checked')
  
  const useSound = document.querySelector('input[name="use_sound"]:checked')
  const sendSms = document.querySelector('input[name="send_sms"]:checked')

  const selectedOptions = {
    website: websiteInput.value,
    query: queryInput.value,
    query_exists: query_exists.value,
    custom_value: customValueInput.value,
    select_type: select_type.value,
    refresh: refreshInput.value,
    delay: delayInput.value,
    onOff: onOff.value,
    useSound: useSound.value,
    sendSms: sendSms.value,
    smsUrl: smsUrlInput.value
  }

  console.log('saveWebsiteClick', selectedOptions)

  chrome.storage.sync.set(selectedOptions);

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: reloadPageOnSave
  });
}

const setupValues = () => {
  chrome.storage.sync.get([
    'website',
    'query',
    'query_exists',
    'custom_value',
    'select_type',
    'refresh',
    'delay',
    'onOff',
    'useSound',
    'sendSms',
    'smsUrl',
  ], (data) => {
    console.log('data here', data)

    // set radio defaults
    const onOffData = data.onOff || 'off'
    const query_existsData = data.query_exists || 'false'
    const select_typeData = data.select_type || 'simple'
    const useSoundData = data.useSound || 'true'
    const sendSmsData = data.sendSms || 'false'

    // target radio buttons
    const onOffRadio = document.getElementById(onOffData)
    const query_existsRadio = document.getElementById(`query_${query_existsData}`)
    const select_typeRadio = document.getElementById(select_typeData)
    const useSoundRadio = document.getElementById(`sound_${useSoundData}`)
    const sendSmsRadio = document.getElementById(`sms_${sendSmsData}`)

    // Inputs
    websiteInput.value = data.website
    queryInput.value = data.query
    refreshInput.value = data.refresh
    delayInput.value = data.delay
    customValueInput.value = data.custom_value
    smsUrlInput.value = data.smsUrl

    // Radio Buttons
    onOffRadio.checked = true
    query_existsRadio.checked = true
    select_typeRadio.checked = true
    useSoundRadio.checked = true
    sendSmsRadio.checked = true

    // Add listener for saving values
    saveButton.addEventListener('click', saveWebsiteClick);

    // Show/Hide based on saved values
    if (select_typeData === 'simple') {
      customSection.style = 'display: none'
    } else {
      simpleSection.style = 'display: none'
    }

    if (sendSmsData === 'false') {
      smsInputSection.style = 'display: none'
    }

    // Add event listeners for hiding / showing certain inputs based on radio button values
    sms_true.addEventListener('click', () => {
      smsInputSection.style = 'display: block'
    })
    sms_false.addEventListener('click', () => {
      smsInputSection.style = 'display: none'
    })

    select_type_custom.addEventListener('click', () => {
      simpleSection.style = 'display: none'
      customSection.style = 'display: block'
    })
    select_type_simple.addEventListener('click', () => {
      customSection.style = 'display: none'
      simpleSection.style = 'display: block'
    })
  });
}

setupValues()
