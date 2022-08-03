const reloadPage = ({ refresh }) => {
  console.log(`Reloading in ${refresh} second(s)`)
  setTimeout(window.location.reload.bind(window.location), Number(refresh) * 1000)
}

const alertUser = async ({ useSound, sendSms, smsUrl }) => {
  console.log('alertUser', { useSound, sendSms, smsUrl })
  if (useSound) {
    const soundUrl = chrome.runtime.getURL("static/sounds/something-happened.mp3")
    const myAudio = new Audio(soundUrl);
    myAudio.play();
  }

  if (sendSms) {
    console.log({ smsUrl })
    try {
      await fetch(smsUrl, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Looks like what you were tracking has changed...go check it out.'
        }),
      })
    } catch (e) {
      console.log('Ran into an error fetching the sns server...', e)
    }

    console.log('success fetching sms')
  }
}

chrome.storage.sync.get([
  'website',
  'query',
  'refresh',
  'delay',
  'onOff',
  'query_exists',
  'select_type',
  'custom_value',
  'useSound',
  'sendSms',
  'smsUrl',
], async ({
  website,
  query,
  refresh,
  delay,
  onOff,
  query_exists,
  select_type,
  custom_value,
  useSound,
  sendSms,
  smsUrl,
}) => {
  console.log('analyze.js - get data', {
    website,
    query,
    refresh,
    delay,
    onOff,
    query_exists,
    select_type,
    custom_value,
    useSound,
    sendSms,
    smsUrl,
  })

  const isOn = onOff === 'on'
  const isSelectedSite = window.location.href.includes(website)
  const shouldRun = isOn && isSelectedSite

  const shouldUseSound = useSound === 'true'
  const shouldSendSms = sendSms === 'true'

  // Exit if the extension is off or diff website
  if (!shouldRun) {
    console.log('shouldRun is false...not running')
    return false
  }

  console.log('Running page alerter...')

  const numberDelay = Number(delay)

  // If delay is > 0 / exists we will pause the script
  if (numberDelay) {
    const convertToMilliseconds = numberDelay * 1000
    console.log(`Waiting ${delay} second(s) first...`)
    await new Promise(resolve => setTimeout(resolve, convertToMilliseconds));
  }
  
  // If it is a query we can target simply with document.querySelector
  if (select_type === 'simple') {
    if (query) {
      const elementToMonitor = document.querySelector(query)
      const elementShouldExist = query_exists === 'true'

      if (elementToMonitor && elementShouldExist) {
        reloadPage({ refresh })
      } else if (!elementToMonitor && !elementShouldExist) {
        reloadPage({ refresh })
      } else if (elementToMonitor && !elementShouldExist) {
        await alertUser({ useSound: shouldUseSound, sendSms: shouldSendSms, smsUrl })
      } else if (!elementToMonitor && elementShouldExist) {
        await alertUser({ useSound: shouldUseSound, sendSms: shouldSendSms, smsUrl })
      } 
      
    } else {
      const message = 'Page Alerter >> You must set an element to monitor...fill out the "Query Selector" field.'
      console.log(message)
      window.alert(message)
    }
  // If we are passing some custom code to evaluate
  } else if (custom_value) {
    // To chrome extensions wont allow us to use eval() or new Function
    // so the work around is to use setTimeout and assign the expression
    // to a window variable we can await / poll for.
    const saveToWindow = `window.pageAlerterHelper = ${custom_value}`

    setTimeout(saveToWindow, 1)
    
    // Here we are just waiting for the custom_value to finish running so
    // so we are polling window.pageAlerterHelper until it exists
    const pollPageAlerterHelper = (resolve) => {
      if (window.pageAlerterHelper) return resolve(window.pageAlerterHelper)
      setTimeout(pollPageAlerterHelper.bind(null, resolve), 50)
    }
    const pageAlerterHelper = await new Promise(resolve => pollPageAlerterHelper(resolve))

    console.log({ pageAlerterHelper })

    if (pageAlerterHelper) {
      await alertUser({ useSound: shouldUseSound, sendSms: shouldSendSms, smsUrl })
    } else {
      reloadPage({ refresh })
    }
  } else {
    console.log('...Nothing set to check')
  }
});
