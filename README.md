# Page Alerter Chrome Extension
A Chrome extension that will track some element on the DOM and will alert you if it has changed based on specified criteria. Don't ask me why the UI isn't written in React...this started off small and eventually grew a bit to be more dynamic.

## Table of Contents
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)

## Installation
To get this installed in your very own Google Chrome you need to go to `chrome://extensions/` in the browser. THEN in the top right select `Developer mode` (You're a developer now!). After that select `Load Unpacked` and select the folder this code lives in.

You should then see the Page Alerter Extension in your list of extensions. Go ahead and turn it on by hitting the slider on the bottom right of the little box the extension is in.

## Setup
When it comes to using the extension the main point of interactivity comes from the extension popup. Within there you will see a few options that should be set in order to get the extension running.

- `Website` - The URL you want the extension to run on
- `Simple or Custom selectors?` - Whether you will be defining a value that can be inserted into `document.querySelector` of if you will be writing a custom expression.
- If `Simple`
  - `Query Selector` - The value you would put within `document.querySelector()`
  - `Should the element exist?` - Determines if you want to be alerted if the query exists or doesn't exist.
- If `Custom`
  - `Custom Expression` - Should be written as if you're asigning to a variable. You will be alerted if this evaluates to true. If you want to be alerted if something doesn't exist then simply wrap your expression in `()` and prepend it with `!`.
- `Refresh rate` - How quickly we refresh the page to look for the element in seconds
- `Delay rate` - How long we wait after the page is loaded to look for the element (useful for stuff that is lazy loaded) in seconds
- `Use Sound` - Boolean that determines if the user wants to be alerted with a sound
- `Send Text` - Boolean that determines if the user wants to be alerted via a Text
- `URL for Text Server` - A url to post to for a text to be sent. (For my purposes I setup a [simple SNS server](https://github.com/ottomanelli/simple-express-sns) that I post to). The extension posts to that URL with a body.message key signifying the message to text.
- `ON / OFF` buttons - Determines if the extension should be running.

## Usage
After filling out all the options the extension should be ready to go. Remember it won't fire on every page unless `Website` is left blank as we check if it matches the website with a simple includes -> `window.location.href.includes(website)`.

One thing to be aware of is there are two different ways to monitor the page. 

1. `Query Selector`, so something that you would put inside of `document.querySelector()`, such as `[data-button-state="SOLD_OUT"]`. In additional you can specify if you'd like that query selector to exist or not (`Simple or Custom selectors?`). For example: if you choose for it to not exist then you will be alerted if the element does exist. 

2. `Custom Expression`, so a custom expression that evaluates to true or false. By that I mean write something as if you're assigning it to a `const/let/var`.

For example:
```
[...document.querySelectorAll('.a-alert-heading')]
    .filter(alert => alert.innerText.toLowerCase().includes('no delivery windows available')).length > 0
```

