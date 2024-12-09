function createElemWithText(elemName = 'p', textContent = '', className = '') {
    const element = document.createElement(elemName);
    element.textContent = textContent;
    if (className) {
        element.className = className;
    }
    return element;
}

function createSelectOptions(users) {
    if (!users) return undefined;
    
    const options = [];
    for (const user of users) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        options.push(option);
    }
    return options;
}

function toggleCommentSection(postId) {
    if(!postId){
        return undefined
    }
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (section) {
        section.classList.toggle('hide');
        return section;
    }else{
        return null;
    }
}

function toggleCommentButton(postId) {
    if(!postId){
        return undefined
    }
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
        button.textContent = button.textContent === 'Show Comments' 
            ? 'Hide Comments' 
            : 'Show Comments';
        return button;
    }else{
        return null;
    }
}

function deleteChildElements(parentElement) {
    if(!(parentElement instanceof HTMLElement)){
        return undefined;
    }
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if (buttons.length) {
        for (const button of buttons) {
            const postId = button.dataset.postId;
            if (postId) {
                button.addEventListener('click', (event) => {
                    toggleComments(event, postId);
                });
            }
        }
        return buttons;
    }
    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    for (const button of buttons) {
        const postId = button.dataset.postId;
        if (postId) {
            button.removeEventListener('click', (event) => {
                toggleComments(event, postId);
            });
        }
    }
    return buttons;
}

function createComments(comments) {
    if(!comments){
        return undefined;
    }
    const fragment = document.createDocumentFragment();
    for (const comment of comments) {
        const article = document.createElement('article');
        const titleElement = createElemWithText('h3', comment.name);
        const bodyElement = createElemWithText('p', comment.body);
        const emailElement = createElemWithText('p', `From: ${comment.email}`);
        
        article.append(titleElement, bodyElement, emailElement);
        fragment.appendChild(article);
    }
    return fragment;
}

function populateSelectMenu(users) {
    if(!users){
        return undefined;
    }
    const selectMenu = document.getElementById('selectMenu');
    const options = createSelectOptions(users);
    
    for (const option of options) {
        selectMenu.appendChild(option);
    }
    return selectMenu;
}

async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function getUserPosts(userId) {
    if(!userId){
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
}

async function getUser(userId) {
    if(!userId){
        return undefined;
    }

    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function getPostComments(postId) {
    if(!postId){
        return undefined;
        }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching post comments:', error);
    }
}

async function displayComments(postId) {
    if(!postId){
        return undefined;
    }
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');
    
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    
    section.appendChild(fragment);
    return section;
}

async function createPosts(posts) {
    if(!posts){
        return undefined;
    }
    const fragment = document.createDocumentFragment();
    
    for (const post of posts) {
        const article = document.createElement('article');
        
        const titleElement = createElemWithText('h2', post.title);
        const bodyElement = createElemWithText('p', post.body);
        const postIdElement = createElemWithText('p', `Post ID: ${post.id}`);
        
        const author = await getUser(post.userId);
        const authorElement = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const companyPhraseElement = createElemWithText('p', author.company.catchPhrase);
        
        const button = createElemWithText('button', 'Show Comments');
        button.dataset.postId = post.id;
        
        const section = await displayComments(post.id);
        
        article.append(
            titleElement, 
            bodyElement, 
            postIdElement, 
            authorElement, 
            companyPhraseElement, 
            button, 
            section
        );
        
        fragment.appendChild(article);
    }
    
    return fragment;
}

async function displayPosts(posts) {
    if(!posts){
        return createElemWithText('p', document.querySelector('.default-text').textContent, 'default-text');
    }
    const mainElement = document.querySelector('main');
    
    const element = await createPosts(posts)
    
    mainElement.appendChild(element);
    return element;
}

function toggleComments(event, postId) {
    if(!event || !postId){
        return undefined;
    }
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(posts) {
    if(!posts){
        return undefined;
    }
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();
    
    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    if (!event || typeof event !== 'object' || !event.target || event.type !== 'change') {
        return undefined;
    }

    const selectMenu = event.target;

    if (!selectMenu || !('value' in selectMenu)) {
        return undefined;
    }

    try {
        const userId = Number.isInteger(Number(selectMenu.value)) 
            ? Number(selectMenu.value) 
            : 1;
        selectMenu.disabled = true;


        const posts = await getUserPosts(userId);
        enumerate_obj_array(posts);


        if (!Array.isArray(posts) || posts.length === 0 || 
            !posts.every(post => post && typeof post === 'object' && post.userId === userId)) {
            return undefined;
        }


        const refreshPostsArray = await refreshPosts(posts);


        selectMenu.disabled = false;
        const retArray = [userId, posts, refreshPostsArray]

        return retArray

    } catch (error) {
        console.error('Error processing menu change:', error);
        selectMenu.disabled = false;
        return undefined;
    }
}
function isIterable(value) {
    return value != null && typeof value[Symbol.iterator] === 'function';
}
function enumerate_obj_array(arr){
    if(!isIterable(arr)){
        return;
    }
    for(item of arr){
        for(prop in item){
            console.log(`${prop}: ${item[prop]}`);
        }
    }
}

async function initPage() {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    
    return [users, select];
}

async function initApp() {
    await initPage();
    
    const selectMenu = document.getElementById('selectMenu');
    selectMenu.addEventListener('change', selectMenuChangeEventHandler);
}
initApp()