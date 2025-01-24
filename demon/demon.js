// ГАЙД ПО МИНИФИКАЦИИ - Z() это обычный док гет элембуид. p() это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 *  вызывается функция 'reStart()', которая вызывает 'helperRequest()' но это мелочи, она назначает глобальные переменные GDPSes, Textures и Guides
 *  если есть вход в аккаунт назначаются ещё и thisUser, myGdpses, mytextures и myguides
 *  после вызывается функция 'getLink()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 *  после выполнения 'getLink()' хелпер готов к работе с клиентом
 */

/* рефакторинг 14-15 сентября
 * задача - переструкторировать гдпс хелпер так чтобы код выглядел более читаемым
 * первое - поставить жизненно важные переменные в начало, выполнено
 * мимолётно был прокомментирован некоторый код
 * второе - расставить всё по регионам, инсерты, прочий мусор, гайды, прочий контент, ибо гайды отличаются сильно, выполнено
 */

const Z = (i) => {
    if (!document.getElementById(i))
        console.error('Cant find element with "'+i+'" id!');
    return document.getElementById(i);
},

helperBuildNum = 81,
helperStrVer = '1.901',
ignoreCap = false,

baseApp = location.origin + location.pathname,

sData = [
    baseApp+'server/content/',
    baseApp+'server/send/',
    baseApp+'server/',
    baseApp+'server/search/',
    baseApp+'server/delete/',
    baseApp+'server/user/',
    '.php'
],
// универсальная функция для запросов на сервер
helperRequest = (url, data = '')=>{
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let method = 'GET';
        if (data !== '') 
            method = 'POST';

        xhr.open(method, url);
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4 && xhr.status === 200) {
                servError = "\n\nSERVER RESP:\n\n"+xhr.response;
                resolve(xhr.response);
            }
            if (xhr.status === 404)
                reject(new Error('404 not found'), xhr);
        };
        // .catch((error)=>{returnError(error+servError)})
        xhr.onerror = ()=>{
            reject(new Error('Network error'), xhr);
        };

        if (data !== '') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(data);
        } else {
            xhr.send();
        };
    });
},
// отображение ошибок у 'helperRequest'
returnError = (err)=>{
    console.error(err);
    document.body.insertAdjacentHTML('beforeend',
        `<div id=debug>`+
            `<p align=center style=margin:0>DEBUG INFO</p>`+
            `<pre style=background-color:#000>`+
                `LOCATION: ${location}\n`+
                `USERID:   ${thisUser[1]}`+
            `</pre>`+
            `ERROR<br>`+
            `<div id=debug2 style=background-color:#000></div>`+
            `<br><br>`+
            `<center>`+
                `<button style=background-color:#333 onclick="location.search=''">`+
                    `FULL RESTART`+
                `</button>`+
                `<button style=background-color:#333 onclick=reStart()>`+
                    `RESTART`+
                `</button><br>`+
                `<button style=background-color:#333 onclick=linkCopy(Z('debug').innerText)>`+
                    `COPY ERROR`+
                `</button>`+
            `</center>`+
        `</div>`
    );
    Z('debug2').innerText = err;
    if (Z('TheLoadingElem'))
        Z('TheLoadingElem').remove();
},
setLink = (val, title = thisUser[7])=>{
    if (!ignore) 
        history.pushState(null, null, '#'+val);
    if (title)
        document.querySelector('title').innerHTML = title;
    ignore = false;
},
getLink = ()=>{
    // там где /// там профильные функции, нужно сделать там p(pageList())
    let actions = {
        '': ()=>                {p(pageList())},
              en: ()=>          {translateReplaceLang('EN',1);p(pageList())},
              ru: ()=>          {translateReplaceLang('RU',1);p(pageList())},
        demons: (listId)=>      {pageDemon(listId)},
        records: (levelId)=>    {p(pageList());demonRecords(levelId,0)},
        list: (listId)=>        {helperContent('list', listId)},
        demon: (demonId)=>      {helperContent('demo', demonId)},
        special: ()=>           {p(uvazuha())},
        about: ()=>             {p(helperAbout())},
        login: ()=>             {loginPage()},
        register: ()=>          {registerPage()},
        profile: ()=>           {p(profilePage())},
        //alarms: ()=>            {p(profilePage(alarmsWindow()));getAlarms()},
        //alarm: (msgId)=>        {p(profilePage(alarmsWindow()));getFullAlarm(msgId)},
        profiles: (userId)=>    {otherProfile(userId,'p(pageList())')},
        lists: ()=>             {p(profilePage(''));getListsLevels()},
        list: (listId)=>        {p(profilePage(''));openList(listId)},
        level: (data)=>         {p(profilePage(''));openLevelTop(data.split('.')[1],data.split('.')[0])},

        admin: ()=>             {adminPanel()}
    };

    let params = window.location.hash
        .replace('#','')
        .split('&')
        .reduce(
            (p,e)=>{
                let a = e.split('=');
                p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                return p;
            },
            {}
        );

    for (let key in params) {
        let value = params[key];
        if (typeof key !== 'undefined') {
            if (typeof value === 'undefined') {
                value = thisUser[1];
            };
            actions[key](value);
        };
    };
},
reStart = (drop = 0)=>{
    if (Z('debug'))
        Z('debug').remove();
    p('');
    token = localStorage.getItem('helperUser');
    let postData = token ? 'token='+token : '';
    Loading();
    helperRequest(sData[2]+'loginT'+sData[6]+location.search, postData)
        .then((data)=>{
            Loading(1);
            let resp = JSON.parse(data);
            DemonLists = resp[1];
            Demons = resp[2];
            thisUser = resp[0];
            getLink();
        })
        .catch((error)=>{returnError(error)});
    if (drop !== 0) {
        translateReplaceLang('RU');
    }
},

// ###HELPERFIND_REGION. работа нового поиска без костылей

helperContent = (type, id, otherData = 0)=>{
    let commType = 0;
    let backFunc = '';
    switch (type) {
        case 'list':
            backFunc = 'pageList())';
            setLink('gdps='+id);
            p(contentPreload(`${id},${commType}`, backFunc));
            break;
        case 'demo':
            commType = 1;
            backFunc = 'pageDemon('+otherData+'))';
            setLink('texture='+id);
            p(contentPreload(`${id},${commType}`, backFunc));
            break;
    };
    Loading();
    helperRequest(`${sData[0]}${type}${sData[6]}?id=${id}`)
        .then((data)=>{
            if (data == '["NONE"]') {
                Loading(1);
                if (type == 'text')
                    p(pageDemon(otherData));
                else
                    p(pageList());
                megaAlert('CONTENTISNULL');
                return;
            }
            let dataForNextButton = `${id},'${type}',1`;

            Loading(1);
            let resp = JSON.parse(data);
            let insert = '';
            switch (type) {
                case 'list':
                    insert = LISTrender(resp);
                    innerComments(renderComms(resp.comments,3,dataForNextButton), 0);
                    break;
                case 'demo':
                    insert = DEMOrender(resp);
                    innerComments(renderComms(resp.comments,4,dataForNextButton), 0);
                    break;
            };
            Z('insertable').innerHTML = insert;
        })
        .catch((error)=>{returnError(error+servError)});
},
helperComments = (postId, type, page = 0)=>{
    Z('nextGdps').remove();
    let typeC = 0;
    let dataForNextButton = `${postId},'${type}',${parseInt(page + 1)}`;
    switch (type) {
        case 'gdps':    type = 0; typeC = 3;    break;
        case 'text':    type = 1; typeC = 4;    break;
        case 'guid':    type = 3; typeC = 6;    break;
        case 'news':    type = 2; typeC = 5;    break;
        case 'newsC':   type = 2; typeC = 5;    break;
    };
    Loading();
    helperRequest(`${sData[0]}fetchComms${sData[6]}?id=${postId}&type=${type}&page=${page}`)
        .then((data)=>{
            Loading(1);
            let resp = JSON.parse(data);
            innerComments(renderComms(resp,typeC,dataForNextButton), 1);
        })
        .catch((error)=>{returnError(error+servError)});
},// ###END_REGION

// ###TRANSLATE_REGION. перевод "Налету", пожалуйста, не трогайте то что есть, я уже не помню за что какое значение отвечает
translateData = {
    RU: {
        'helperVer':'ver - '+helperStrVer+' <span style=opacity:50%>(BUILD '+helperBuildNum+')</span>',
        'src':'../imgs/RU.png',
        'loading...':'Загрузка...',
        'profile':'Профиль',
        'yourProf':'Ваш профиль',
        'register':'Регистрация',
        'login':'Вход',
        'logout':'Выход',
        'logout2':'Выйти из аккаунта', 
        'dropPass':'Сбросить пароль',
        'edit':'Изменить',
        'back':'Назад',
        'textures':'Текстурпаки',
        'helperDs':'Дискорд сервер',
        'yes':'Да',
        'no':'Нет',
        'GDtag01':'Старее 2.1',
        'GDtag02':'2.1',
        'GDtag03':'2.2',
        'GDtag04':'Малый сервер',
        'GDtag05':'Большой сервер',
        'GDtag06':'Бесплатный хостинг',
        'GDtag07':'Личный хостинг',
        'GDtag08':'Заказной хостинг',
        'GDtag09':'Модификации',
        'GDtag10':'Текстуры',
        'GDtag11':'Встроенные читы',
        'GDtag12':'Windows',
        'GDtag13':'MacOS',
        'GDtag14':'Android',
        'GDtag15':'IOS',
        'mostLike':'Самое лайкнутое',
        'mostDisl':'Самое дизлайкнутое',
        'search1':'Последняя активность',
        'search2':'Идёт набор на модераторов',
        'search3':'Идёт креатор контест',
        'search4':'Самые новые',
        'TXtag01':'1.9',
        'TXtag02':'2.0',
        'TXtag03':'2.1',
        'TXtag09':'2.2',
        'TXtag04':'Недоделаный',
        'TXtag05':'Изменены звуки',
        'TXtag06':'Изменена музыка',
        'TXtag07':'Изменены иконки',
        'TXtag08':'Изменены блоки',
        'TXtag12':'Low',
        'TXtag13':'Medium',
        'TXtag14':'High',
        'TXtag15':'Есть на Android',
        'search':'ГДПСы',
        'searchT':'Текстурпаки',
        'findByName':'Найдите по названию',
        'gdpsName':'Название уровня',
        'listHelp1':'если вы ищете гдпс которого нету в листе то добавьте его! но перед этим зарегистрируйтесь',
        'tags00':'Выберите теги',
        'os00':'Платформа',
        'otherSort':'Метод поиска',
        'afterGD':'После изменения ваш гдпс будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'textQual':'Качество текстур <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько тегов)</span>:',
        'addText01':'Аватар Текстурпака:',
        'addText02':'Ссылка на скачивание ПК:',
        'addText03':'Ссылка на скачивание Андроид:',
        'addText':'Добавить Текстурпак',
        'editText':'Изменить Текстурпак',
        'editGdps':'Изменить ГДПС',
        'afterTX':'После изменения ваш текстурпак будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'special00':'Благодарит этих людей',
        'special01':'Создание "майского билда"',
        'special02':'Майский билд (почти) в оригинале',
        'special03':'"Новый" стиль сайта и новая главная страница',
        'special04':'Большинство идей для проекта GDPS Helper и доработка "майского билда", дорабатывает веб сайт проекта в одниночку с релиза (0\.91 - 1\.8)',
        'special05':'Стиль сайта на июнь',
        'special06':'Поиск дыр в безопасности сайта',
        'special07':'Стиль сайта на октябрь',
        'special08':'Вы все, кто пользуется сайтом',
        'special09':'Помощь в создании системы перевода "налету"',
        'special10':'Огромная помощь в дизайне на лето 2024',
        'profName':'Отображаемый никнейм',
        'profId':'ID пользователя',
        'profRole':'Роль',
        'profAccs':'Ваш аккаунт ',
        'notProfAccs':'Аккаунт ',
        'isActive':'Активирован',
        'isNotact':'Неактивирован',
        'yourGdpses':'Ваши ГДПСы',
        'Alarms':'Уведомления',
        'yourTexts':'Ваши Текстурпаки',
        'yourGuides':'Ваши Гайды',
        'alarms01':'Сообщения от администрации',
        'msgs':'Сообщения',
        'fullMsgs':'Полный текст',
        'role00':'Нет',
        'role01':'Менеджер',
        'role02':'Админ',
        'role03':'Главный Админ',
        'weekGdps':'ГДПС Недели',
        'addedBy':'Автор',
        'moreInfo':'Подробнее',
        'checkNews':'Просмотреть новости',
        'getLink':'Скопировать ссылку',
        'showMore':'Показать больше',
        'loggedAs':'Вход выполнен',
        'commSend':'Отправить',
        'min10chars':'минимум 10 символов',
        'joinToGdps':'Войти',
        'account':'Аккаунт',
        'newsNone':'Ничего нет',
        'newsNoneReal':'Новостей с ГДПСа нет',
        'remindPass':'Забыли пароль?',
        'login01':'Логин или Почта',
        'login02':'Пароль',
        'login03':'Адрес эл. почты',
        'login04':'Новый пароль',
        'login05':'Адрес эл. почты',
        'login06':'Логин',
        'gdpsLang00':'Язык',
        'gdpsLang01':'Русский',
        'gdpsLang02':'Английский',
        'gdpsLang03':'Испанский',
        'notYourProf':'Профиль',
        'notYourGdpses':'ГДПСы',
        'notYourTexts':'Текстурпаки',
        'textNone':'Нету',
        'delete':'Удалить',
        'coowners':'Со-владельцы',
        'idOrName':'ID пользователя',
        'joinsTo':'Переходы на',
        'joins':'Переходы',
        'coownersNone':'Вы со-владелец',
        'CCtrue':'Проводится',
        'CCfalse':'Не проводится',
        'isCC':'Проходит креатор контест',
        'isMC':'Проходит набор на модераторов',
        'isJE':'Требуется авторизация на сайте для входа в дискорд сервер',
        'isBL':'Бампнуть',
        'comms':'Комментарии',
        'commsNone':'Комментариев нет',
        'submit':'Подтвердить',
        'passReset':'Сброс пароля',
        'passResetIf':'Если вдруг вы владеете старым аккаунтом, на котором не привязана почта то обратитесь к администрации в дискорде',
        'addNews':'Новый новостной пост',
        'publishNews':'Опубликовать',
        'newsText':'Текст поста',
        'needLogin':'Требуется регистрация',
        'timeAgo01':' секунд назад',
        'timeAgo02':' минут и ',
        'timeAgo03':' секунд назад',
        'timeAgo04':' часов и ',
        'timeAgo05':' минут назад',
        'timeAgo06':' дней и ',
        'timeAgo07':' часов назад',
        'timeAgo08':' недель и ',
        'timeAgo09':' дней назад',
        'timeAgo10':' месяцев и ',
        'timeAgo11':' недель назад',
        'timeAgo12':'давно',
        'report01':'Жалоба на ГДПС',
        'report02':'Причина жалобы (например - не работает ссылка входа)',
        'otmena':'Отмена',
        'copied':'Скопировано!',
        'reported':'Отправлено!',
        'aboutHelper':'О GDPS Helper',
        'history01':'Историческая справка',
        'history02':'17 ноября 2021 был создан дискорд сервер "ГДПС Топ", по сути пра-пра-предшественник GDPS Helper, 26 мая 2023 года GDPS Helper получает своё текущее название, 9 июня открывается первая версия сайта, которая спустя почти пол года работы и 2 года существования GDPS Helper была переделана в JavaScript приложение 17 ноября 2023 года, на текущий момент мы насчитываем более 100 проверенных гдпсов у себя в листе',
        'HLadmin':'Администрация',
        'HLthanks':'Особые благодарности',
        'newNick':'новый никнейм',
        'guides00':'Гайды',
        'guides01':'Новый гайд',
        'guides02':'Название',
        'guides03':'Добавить',
        'guides04':'Послесловие (например кто автор)',
        'guides05':'Картинка',
        'guides06':'Название раздела',
        'guides07':"Текст раздела\n\nесть частичная поддержка Markdown (заголовки и ссылки)\n\nдля добавления картинки введите ![](link)",
        'guides08':'Изменить гайд',
        'getLogin':'Получить логин',
        'wrongPass':'Неправильный пароль!',
        'accountEmpty':'Такого аккаунта не существует!',
        'loginClaimed':'Логин или почта уже заняты!',
        'captchaDed':'Капча не пройдена!',
        'CONTENTISNULL':'ОШИБКА: data пустой, не вводите неправильный ID',
        'wait1':'Жди ещё ',
        'wait2':' секунд',
        'DMlists':'Листы уровней',
        'DMlist':'Уровни листа',
        'DMcreate':'Создать лист',
        'DMcreate2':'Создать',
        'youtube':'Ссылка на видео',
        'youTube':'Смотреть',
        'DMlevel':'Добавить уровень',
        'DMnote':'Напоминание - сортировка уровней идёт от меньших к большему по значению Top position<br><br>Подсказка - для изменения любого значения (кроме ID) тыкните по нему 2 раза',
        'levTOP':'Рекорды',
        'authorid':'GDPS ID юзера',
        'authorname':'GDPS никнейм',
        'progress':'Прогресс (%)',
    },
    EN: {
        'helperVer':'ver - '+helperStrVer+' <span style=opacity:50%>(BUILD '+helperBuildNum+')</span>',
        'src':'../imgs/EN.png',
        'loading...':'Loading...',
        'profile':'Profile',
        'yourProf':'Your profile',
        'register':'Register',
        'login':'Login',
        'logout':'Logout',
        'logout2':'Logout of your account',
        'dropPass': 'Reset password',
        'edit':'Edit',
        'back':'Back',
        'textures':'Texturepacks',
        'helperDs':'Discord server',
        'yes':'Yes',
        'no':'No',
        'GDtag01':'Older than 2.1',
        'GDtag02':'2.1',
        'GDtag03':'2.2',
        'GDtag04':'Small server',
        'GDtag05':'Large server',
        'GDtag06':'Free hosting',
        'GDtag07':'Self hosting',
        'GDtag08':'Paid hosting',
        'GDtag09':'Mods',
        'GDtag10':'Textures',
        'GDtag11':'Built-in cheats',
        'GDtag12':'Windows',
        'GDtag13':'MacOS',
        'GDtag14':'Android',
        'GDtag15':'IOS',
        'mostLike':'Most liked',
        'mostDisl':'Most disliked',
        'search1':'Last activity',
        'search2':'Mod. recruitment',
        'search3':'Creator contest',
        'search4':'Recent',
        'TXtag01':'1.9',
        'TXtag02':'2.0',
        'TXtag03':'2.1',
        'TXtag09':'2.2',
        'TXtag04':'Unfinished',
        'TXtag05':'Changed sounds',
        'TXtag06':'Сhanged music',
        'TXtag07':'Сhanged icons',
        'TXtag08':'Сhanged blocks',
        'TXtag12':'Low',
        'TXtag13':'Medium',
        'TXtag14':'High',
        'TXtag15':'Android',
        'search':'GDPSes',
        'searchT':'Texturepacks',
        'findByName':'Find by name',
        'gdpsName':'Level name',
        'listHelp1':'If you are looking for a gdps that isnt in the list, then add it! But before that, register',
        'tags00':'Select tags',
        'os00':'Platform',
        'otherSort':'Search method',
        'afterGD':'After edit, your gdps will be banned <span style=opacity:50%>(if previously verified)</span>',
        'textQual':'Texture quality <span style=opacity:50%>(Windows: hold down CTRL to add multiple tags)</span>:',
        'addText01':'Texture Pack Avatar:',
        'addText02':'PC download Link:',
        'addText03':'Android download link:',
        'addText':'Add Texturepack',
        'editText':'Edit Texturepack',
        'editGdps':'Edit GDPS',
        'afterTX':'After edit, your texturepack will be banned <span style=opacity:50%>(if previously verified)</span>',
        'special00':'Thanks these people',
        'special01':'"May build" development',
        'special02':'May build is (almost) in the original',
        'special03':'A "new" website style and a new home page',
        'special04':'Most of the ideas for the GDPS Helper project and the revision of the "May build", the project\'s website is being finalized one day from the release (0\.91 - 1\.8)',
        'special05':'Website style for June',
        'special06':'Search for security bugs in the site',
        'special07':'Website style for October',
        'special08':'All of you who use the site',
        'special09':'Assistance in creating a translation system',
        'special10':'A huge help in the design for the summer of 2024',
        'profName':'Nickname',
        'profId':'UserID',
        'profRole':'Role',
        'profAccs':'Your account ',
        'notProfAccs':'Account',
        'isActive':'Activated',
        'isNotact':'Unactivated',
        'yourGdpses':'Your GDPSes',
        'Alarms':'Notifications',
        'yourTexts':'Your Texturepacks',
        'yourGuides':'Your Guides',
        'alarms01':'Messages by administration',
        'msgs':'Messages',
        'fullMsgs':'Full text',
        'role00':'No',
        'role01':'Manager',
        'role02':'Admin',
        'role03':'Head Admin',
        'weekGdps':'Weekly GDPS',
        'addedBy':'Author',
        'moreInfo':'Learn more',
        'checkNews':'View GDPS news',
        'getLink':'Copy link',
        'showMore':'Show more',
        'loggedAs':'Logged as',
        'commSend':'Send',
        'min10chars':'Minimum 10 characters',
        'joinToGdps':'Join',
        'account':'Account',
        'newsNone':'Nothing found',
        'newsNoneReal':'There is no news from GDPS',
        'remindPass':'Forgot password?',
        'login01':'Login or Email',
        'login02':'Password',
        'login03':'Email address',
        'login04':'New password',
        'login05':'Email address',
        'login06':'Login',
        'gdpsLang00':'Language',
        'gdpsLang01':'Russian',
        'gdpsLang02':'English',
        'gdpsLang03':'Spanish',
        'notYourProf':'Profile',
        'notYourGdpses':'GDPSes',
        'notYourTexts':'Texturepacks',
        'textNone':'Nothing',
        'delete':'Delete',
        'coowners':'Co-owners',
        'idOrName':'userID',
        'joinsTo':'Joins to',
        'joins':'Joins',
        'coownersNone':'You are co-owner',
        'CCtrue':'Held',
        'CCfalse':'Not held',
        'isCC':'Creator contest',
        'isMC':'Recruitment for moderators',
        'isJE':'Authorization required to join in discord server',
        'isBL':'Bump',
        'comms':'Comments',
        'commsNone':'There are no comments',
        'submit':'Confirm',
        'passReset':'Password Reset',
        'passResetIf':'If you suddenly own an old account that does not have mail linked to it, then contact the admins in the discord',
        'addNews':'New News Post',
        'publishNews':'Publish',
        'newsText':'text',
        'needLogin':'Registration is required',
        'timeAgo01': ' seconds ago', 
        'timeAgo02': ' minutes and ', 
        'timeAgo03': ' seconds ago', 
        'timeAgo04': ' hours and ', 
        'timeAgo05': ' minutes ago', 
        'timeAgo06': ' days and ', 
        'timeAgo07': ' hours ago', 
        'timeAgo08': ' weeks and ', 
        'timeAgo09': ' days ago', 
        'timeAgo10': ' months and ', 
        'timeAgo11': ' weeks ago', 
        'timeAgo12': 'long ago', 
        'report01':'Report GDPS',
        'report02':'The reason of report (for example, the join link does not work)',
        'otmena':'Cancel',
        'copied':'Copied!',
        'reported':'Sent!',
        'aboutHelper':'About GDPS Helper',
        'history01':'Historical note',
        'history02':'November 17, 2021 was created discord server “ГДПС Топ”, in fact the great-great-predecessor of GDPS Helper, May 26, 2023 GDPS Helper gets its current name, June 9 opens the first version of the site, which after almost half a year of work and 2 years of existence GDPS Helper was converted into a JavaScript application November 17, 2023, at the moment we have more than 100 verified gdps on our list',
        'HLadmin':'Administration',
        'HLthanks':'Special thanks',
        'newNick':'new nickname',
        'guides00':'Guides',
        'guides01':'New guide',
        'guides02':'Title',
        'guides03':'Add Section',
        'guides04':'Afterword (such as who the author)',
        'guides05':'Picture',
        'guides06':'Title of section',
        'guides07':"Section text\n\nthere is partical Markdown support (heading and links)\n\nto add image enter ![](link)",
        'guides08':'Edit guide',
        'getLogin':'Get login',
        'wrongPass':'Wrong Password!',
        'accountEmpty':'That account doesn\'t exist!',
        'loginClaimed':'Login or mail is already taken!',
        'captchaDed':'Captcha didn\'t pass!',
        'CONTENTISNULL':'ERROR: data is null, don\'t write wrong ID',
        'wait1':'Wait ',
        'wait2':' seconds',
        'DMlists':'Level lists',
        'DMlist':'List\'s levels',
        'DMcreate':'Create list',
        'DMcreate2':'Create',
        'youtube':'Link to video',
        'youTube':'Watch',
        'DMlevel':'Add level',
        'DMnote':'Reminder - levels are sorted from smaller to larger by Top position value<br><br>Tip - to change any value (except ID), double click on it.',
        'levTOP':'Positions',
        'authorid':'GDPS author ID',
        'authorname':'GDPS author Name',
        'progress':'Progress (%)',
    }
},
getTrans = (id)=>{
    try {
        return translateData[mainLang][id];
    } catch (err) {
        mainLang = 'RU';
        localStorage.setItem('helperLang', 'RU');
        returnError(err);
    }
},
translateReplaceLang = (lang)=>{
    mainLang = lang;
    localStorage.setItem('helperLang', lang);
    document.querySelectorAll('[data-trans]').forEach((el)=>{
    let key = el.getAttribute('data-trans');
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'IMG') {
            el.innerHTML = translateData[lang][key];
        } else if (el.tagName !== 'IMG') {
            el.setAttribute('placeholder', translateData[lang][key]);
        } else {
            el.src = translateData[lang][key];
        };
    });
},// ###END_REGION

// ###INSERT_REGION. вставка в разные куски страницы, функция p упомянута тут, за остальные поясню ниже
p = (textContent, insertType = 0)=>{
    if (!Z('1st')) 
        return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
    if (insertType == 0) 
        Z('1st').innerHTML = textContent;
    else 
        Z('1st').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = (textContent)=>{
    Z('profileWindow').innerHTML = textContent;
},
// вставка контента под рамкой поиска
innerGdpsPlace = (textContent, insert = 0)=>{
    if (insert == 0) // профили
        Z('GDPSesPlace').innerHTML = textContent;
    else if (insert >= 1) // в поиске устарел
        Z('GDPSesPlace').insertAdjacentHTML('beforeend', textContent);
    else 
        // в поиске но лучще это
        Z('GDPSesPlace').insertAdjacentHTML('afterend', textContent);
},// ###END_REGION

// ###PUBLIC_CONTENT_REGION
sendRegisterForm = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let email    = Z('LGemail'   ).value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha || ignoreCap) {
        Loading();
        helperRequest(
            `${sData[5]}register${sData[6]}${location.search}`,
            `username=${username}&password=${password}&email=${email}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
            switch (data) {
                case '-1':
                    megaAlert('loginClaimed');
                    break;
                case '-2':
                    megaAlert('captchaDed');
                    break;
                default:
                    let resp = JSON.parse(data);
                    thisUser = resp[0];
                    DemonLists = resp[1];
                    Demons = resp[2];
                    dropLogin(1);
                    localStorage.helperUser = thisUser[6];
                    thisUser.pop();
            }
        })
        .catch((error)=>{returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendLoginForm = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha || ignoreCap) {
        Loading();
        helperRequest(
            `${sData[5]}login${sData[6]}${location.search}`,
            `username=${username}&password=${password}`+
            `&g-recaptcha-response=${hcaptcha}&h-captcha-response=${hcaptcha}`
        )
        .then(data => {
            Loading(1);
            switch (data) {
                case '-1':
                    megaAlert('wrongPass');
                    break;
                case '-2':
                    megaAlert('accountEmpty');
                    break;
                case '-3':
                    megaAlert('captchaDed');
                    break;
                default:
                    let resp = JSON.parse(data);
                    thisUser = resp[0];
                    DemonLists = resp[1];
                    Demons = resp[2];
                    dropLogin(1);
                    localStorage.helperUser = thisUser[6];
                    thisUser.pop();
            }
        })
        .catch((error)=>{returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendDrop = ()=>{
    let username = Z('LGusername').value;
    let password = Z('LGpassword').value;
    let email    = Z('LGemail'   ).value;
    Loading();
    helperRequest(
        `${sData[5]}drop${sData[6]}${location.search}`,
        `username=${username}&password=${password}&email=${email}`
    )
    .then(data => {
        Loading(1);
        if (data == '-1')
            return alert('неа');
        else if (data == '1')
            if (thisUser[0] !== '???')
                dropLogin(1);
    })
    .catch((error)=>{returnError(error+servError)});
},
gLogout = ()=>{
    Loading();
    helperRequest(`${sData[5]}logout${sData[6]}${location.search}`)
        .then(()=>{
            Loading(1);
            let discord = thisUser[6];
            let title = thisUser[7];
            thisUser = ['???',0,0,0,0,discord,title];
            localStorage.removeItem("helperUser");
            token = undefined;
            p(pageList());
        })
        .catch((error)=>{returnError(error+servError)});
},

editNickPre = ()=>{
    Z('newNick').innerHTML =
    `<input class="framelabel" id=newNick2 data-trans="newNick" placeholder="${getTrans('newNick')}">`+
    `<button data-trans="edit" onclick="editNick()" class=loginbtn>${getTrans('edit')}</button>`;
},
editNick = ()=>{
    let newNick = Z('newNick2').value;
    helperRequest(`${sData[5]}setNickname${sData[6]}${location.search}&name=${newNick}`)
        .then(data => {
            let timename = thisUser[0].slice();
            thisUser[0] = data;
            for (let gdpsKey in myGdpses[0]) {
                if (myGdpses[0][gdpsKey][7] == timename) {
                    myGdpses[0][gdpsKey][7] = data;
                }
            }
            for (let gdpsKey in mytextures[0]) {
                if (mytextures[0][gdpsKey][7] == timename) {
                    mytextures[0][gdpsKey][7] = data;
                }
            }
            // потом сделать во всех гдпсах и текстурах
            Z('oldNick').innerHTML = data;
            Z('newNick').innerHTML = '';
        })
},// ###END_REGION

// ###PAGES_REGION
pHeader = (predrop = '')=>{
    searchMethod = 0;
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let html = 
    `<div class="header" align="left">`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}p(pageList())">`+
            `<img src="../imgs/gdpsnew.svg" width=32px>`+
        `</button>`+
        //`<button style="width:32px" class="emptybtn" onclick="${predrop}p(helperAbout())">`+
        //    `<img src="../imgs/about.svg" width=32px>`+
        //`</button>`+
        `<button style="width:32px" class="emptybtn" onclick="location.href = '${thisUser[6]}'">`+
            `<img src="../imgs/disc.svg" width=32px>`+
        `</button>`+
        `<nodiv id=switchHtmlLang style=position:relative>`+
            `<button onclick="switchLang()" style="width:32px" class="emptybtn">`+
                `<img data-trans="src" src="../imgs/${mainLang}.png" width=32px style="padding-bottom:6px">`+
            `</button>`+ // !ПОИСК! switchLang = function
        `</nodiv>`+
        `<div style=position:absolute;right:8px;top:24px>`+
            `<nodiv id=switchLogin style=position:relative>`+
                `${thisUser[1] === 0 ? `<button id=regBtn class="emptybtn" style="position:absolute;top:-8px;right:40px" data-trans="register" onclick="${predrop}registerPage()">${getTrans('register')}</button>` : ''}`+
                `<button id=btnLogin style="width:20px;margin-left:20px" class="emptybtn" onclick="${predrop}switchLogin(32,'')">`+
                    `<span style=position:absolute;right:0;top:-8px${
                        thisUser[1] === 0 ? // if
                            ' data-trans=login>'+getTrans('login')
                        : // else 
                            '>'
                        + (
                        thisUser[4] == 1 ? // if
                            '<span style="position:absolute;top:-4px;right:-4px;border:solid red 3px;border-radius:8px"></span>' 
                        : // else 
                            '')+thisUser[0] // я ебал это говно
                    }</span>`+
                `</button>`+ // !ПОИСК! switchLogin = function
            `</nodiv>`+
        `</div>`+
    `</div>`;
    return html;
},
pageList = ()=>{
    setLink('');
    let html = pHeader()+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
        LISTrender(DemonLists)+
    `</div>`;
    //insertBtn('sendFinder(1,\'method=3\')');
    return html;
    
},
pageDemon = (listId, page = 0)=>{
    setLink('demons='+listId);
    let html = pHeader()+
    `<h1 align=center id=listName></h1>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
    `</div>`+
    insertBtn(`getLevels(${listId},${parseInt(page+1)})`);
    p(html);
    Loading();
    helperRequest(`${sData[3]}demons${sData[6]}?list=${listId}&page=${page}`)
        .then(data => {
            Loading(1);
            let parsedData = JSON.parse(data);
            Z('listName').innerHTML = parsedData.name;
            innerGdpsPlace(DEMOrender(parsedData));
        })
        .catch((error)=>{returnError(error+servError)});

},
getLevels = (listId, page)=>{
    Z('nextGdps').remove()
    Loading();
    helperRequest(`${sData[3]}demons.php?list=${listId}&page=${page}`)
        .then(data => {
            Loading(1);
            let parsedData = JSON.parse(data);
            Z('listName').innerHTML = parsedData.name;
            innerGdpsPlace(DEMOrender(parsedData), page);
            if (Object.keys(parsedData).length >= 12)
                innerGdpsPlace(insertBtn(`getLevels(${listId},${parseInt(page+1)})`),-1);
        })
        .catch((error)=>{returnError(error+servError)});
},
uvazuha = ()=>{
    setLink('special');
    let html = pHeader()+
    `<div align=center>`+
        `<h1>GDPS Helper</h1>`+
        `<h2 data-trans="special00">${getTrans('special00')}</h2>`+
        `<div class=frameguide align=left>`+
            `<p>DenisC - <span               data-trans="special01">${getTrans('special01')}</span></p>`+
            `<a class="loginbtn" href=./DA2/ data-trans="special02">${getTrans('special02')}</a>`+
            `<p>Vustur - <span               data-trans="special03">${getTrans('special03')}</span></p>`+
            `<p>MIOBOMB - <span              data-trans="special04">${getTrans('special04')}</span></p>`+
            `<p>lemongd - <span              data-trans="special05">${getTrans('special05')}</span></p>`+
            `<p>??? - <span                  data-trans="special06">${getTrans('special06')}</span></p>`+
            `<p>mirvis - <span               data-trans="special07">${getTrans('special07')}</span></p>`+
            `<p>glorius - <span              data-trans="special09">${getTrans('special09')}</span></p>`+
            `<p>M41den  - <span              data-trans="special09">${getTrans('special10')}</span></p>`+
            `<h2 data-trans="special08">${getTrans('special08')}</h2>`+
            `<br><br>`+
        `</div>`+
    `</div>`;
    return html;
},
helperAbout = ()=>{
    setLink('about');
    let html = pHeader()+
    `<div class=frameprofile style=text-align:left>`+
        `<h1 data-trans="aboutHelper">${getTrans('aboutHelper')}</h1>`+
        `<h2 data-trans="history01">${getTrans('history01')}</h2>`+
        `<p data-trans="history02">${getTrans('history02')}</p>`+
        `<h2 data-trans="HLadmin">${getTrans('HLadmin')}</h2>`+
        `<div style="display:flex;flex-wrap:wrap">`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>MIOBOMB</span> - `+
                    `<span data-trans="role03">${getTrans('role03')}</span>`+
                `</p>`+
                `<img width=128px src="../imgs/mio.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>Vustur</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="../imgs/vus.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>DenisC!!!</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="../imgs/denis.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>kot_v_palto</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="../imgs/palto.png">`+
            `</div>`+
        `</div>`+
        `<button data-trans="HLthanks" class="loginbtn" onclick="p(uvazuha())">`+
            getTrans('HLthanks')+
        `</button>`+
    `</div>`;
    return html;
},
dropLogin = (type = 0)=>{
    let hcaptchaHtml = Z('2st');
    if (type === 0) {
        Z('3st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'block';
    } else if (type === 1) {
        Z('4st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'none';
        p(pageList());
    };
},
loginPage = ()=>{
    setLink('login');
    let html = pHeader('predrop')+
    `<div class="frameprofile">`+
        `<h1 data-trans="login">${getTrans('login')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input style=margin-left:20px data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}">`+
        `<button class=emptybtn onclick=seePassword()>`+
            `<img id=LGbtn style=margin:-12px;margin-left:0 src=../imgs/PShide.svg width=32px>`+
        `</button><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="remindPass" onclick="dropLogin(1);p(dropWindow())" class="loginbtn">${getTrans('remindPass')}</button><br><br>`+
        `<button data-trans="joinToGdps" onclick="sendLoginForm()" class="loginbtn">${getTrans('joinToGdps')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
        `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
    `</div>`;
    p(html);
    dropLogin();
},
registerPage = ()=>{
    setLink('register');
    let html = pHeader('predrop')+
    `<div class="frameprofile">`+
        `<h1 data-trans="register">${getTrans('register')}</h1>`+
        `<input data-trans="login06" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login06')}"><br><br>`+
        `<input style=margin-left:20px data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}">`+
        `<button class=emptybtn onclick=seePassword()>`+
            `<img id=LGbtn style=margin:-12px;margin-left:0 src=../imgs/PShide.svg width=32px>`+
        `</button><br><br>`+
        `<input data-trans="login03" id="LGemail"    class="framelabel" required placeholder="${getTrans('login03')}"><br><br>`+
            `<div id=3st></div><br><br>`+
        `<button data-trans="register" onclick="sendRegisterForm()" class="loginbtn">${getTrans('register')}</button><br>`+
        `<br><button data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
        `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
    `</div>`;
    p(html);
    dropLogin();
},
contentPreload = (sendCommData = '', backFunc = '')=>{
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="p(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`;
    if (thisUser[1] !== 0) html += 
    `<div class="framemain" style="height:60px">`+
        `<p style="margin:0">`+
            `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
            `${thisUser[0]}`+
        `</p>`+
        `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
        `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn">${getTrans('commSend')}</button>`+
    `</div>`;
    html += 
    `<div id="comments"></div>`;
    return html;
},
insertBtn = (lastUse)=>{// кнопка "показать больше"
    return `<div id=nextGdps class=gdps-helper align=center>
        <button data-trans="showMore" onclick="${lastUse}" class=loginbtn style="font-size:32px; padding: 4px 8px; margin: 12px 0;">
            ${getTrans('showMore')}
        </button>
    </div>`;
},

profilePage = (innerHtnl = gProfileMini())=>{
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:auto">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone())">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position:absolute;top:95px;width:235px" align="left">`+
            `<button data-trans="profile" class=loginbtn onclick="innerProfile(gProfileMini())">${getTrans('profile')}</button><br><br>`+
            (thisUser[5] ? `<button data-trans="DMlists" class=loginbtn onclick="getListsLevels()">${getTrans('DMlists')}</button><br><br>` : '')+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
            innerHtnl+
        `</div>`+
        `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
    `</div>`;
    return html;
},
otherProfile = (userId, backButton, innerHtnl = otherProfileMini)=>{
    let html = pHeader()+
    `<div class=frameprofile style="margin:0;height:auto">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone(${userId}, '${backButton}'))">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position:absolute;top:95px;width:235px" align="left">`+
            `<button data-trans="profile"   class=loginbtn onclick="otherProfileMini(${userId})"   >${getTrans('profile')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
        `</div>`+
    `</div>`;
    p(html);
    innerHtnl(userId);
},// ###END_REGION

// ###OWNER_CONTENT_REGION
getConfInfo = (step = 0)=>{
    if (step == 0) {
        let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
            `<div class="upperWindow frameprofile ANIM-create2" id=F45>`+
                `<form id=formLINK method=post onsubmit="return false">`+
                    `<input data-trans="login02" placeholder=${getTrans('login02')} class=framelabel id=LGpassword><br>`+
                    `<button data-trans="otmena" onclick="Z('formLINK').setAttribute('onsubmit','return false');closeWindow('F45')" class=loginbtn>${getTrans('otmena')}</button>`+
                    `<button data-trans=commSend onclick=getConfInfo(1);closeWindow('F45') class=loginbtn>${getTrans('commSend')}</button>`+
                `</form>`+
            `</div>`+
        `</div>`;
        p(html,1);
    } else {
        let password = Z('LGpassword').value;
        Z('F45').remove();
        Loading();
        helperRequest(`${sData[5]}getAccInfo${sData[6]}`, 'password='+password)
            .then(data => {
                Loading(1);
                if (data == '-1') {
                    megaAlert('wrongPass');
                } else {
                    let parsedData = JSON.parse(data),
                        html2 = `<div id=blackEffect class="megaWindow ANIM-create1">`+
                            `<div class="upperWindow frameprofile ANIM-create2" id=F90 align=left>`+
                                `<span data-trans="login06">${getTrans('login06')}</span>: ${parsedData[0]}<br>`+
                                `<span data-trans="login03">${getTrans('login03')}</span>: ${parsedData[1]}<br><br>`+
                                `<button data-trans="otmena" onclick="closeWindow('F90')" class=loginbtn>${getTrans('back')}</button>`+
                            `</div>`+
                        `</div>`;
                    p(html2,1);
                }
            })
            .catch((error)=>{console.error(error);returnError(error+servError)});
    }
},
removeAlarm = (id)=>{
    Loading();
    helperRequest(`${sData[1]}deleteAlarm${sData[6]}?id=${id}`)
    .then(() => {
        Loading(1);
        Z('btn'+id).remove();
        Z('fullAlarm').remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
coownersMenu = (id, contentType)=>{
    let contentTypeNew = contentType - 3;
    Loading();
    helperRequest(`${sData[0]}getOwners${sData[6]}?id=${id}&type=${contentType}`)
        .then(data => {
            Loading(1);
            if (contentType == 3)
                setLink('gdpsOwn='+id);
            else 
                setLink('textureOwn='+id);
            let parsedData = JSON.parse(data);
            let html = 
            `<div>`+
                `<h1><span data-trans="coowners">${getTrans('coowners')}</span> ${parsedData[0]}</h1>`+
                `<table id=comments>`+
                    `<tr>`+
                        `<td data-trans="profName">${getTrans('profName')}</td>`+
                        `<td data-trans="delete">${getTrans('delete')}</td>`+
                    `</tr>`;

            parsedData[1].forEach(arrat => {
                html +=
                    `<tr id=perm${arrat[1]}>`+
                        `<td>`+
                            arrat[0]+
                        `</td>`+
                        `<td>`+
                            `<button data-trans="delete" class=loginbtn onclick="deleteOwner(${id},${contentTypeNew},${arrat[1]})">${getTrans('delete')}</button>`+
                        `</td>`+
                    `</tr>`;
            });

            html += 
                `</table><br><br>`+
                `<input data-trans="idOrName" style="width:120px" id="addown" class="framelabel" placeholder="${getTrans('idOrName')}">`+
                `<button class="loginbtn" onclick="ownersAdd(${id},${contentTypeNew})">+</button>`+
            `</div>`;
            innerProfile(html);
        })
        .catch((error)=>{returnError(error+servError)});
},
ownersAdd = (id, type)=>{
    let userData = Z('addown').value;
    Loading();
    helperRequest(`${sData[1]}permAdd${sData[6]}?g=${id}&type=${type}&user=${userData}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            let parsedData = JSON.parse(data);
            let html =
                `<tr id=perm${parsedData[1]}>`+
                    `<td>`+
                    parsedData[0]+
                    `</td>`+
                    `<td>`+
                        `<button data-trans="delete" class=loginbtn onclick="deleteOwner(${id},${type},${parsedData[1]})">${getTrans('delete')}</button>`+
                    `</td>`+
                `</tr>`;
            innerComments(html, 1);
        })
        .catch((error)=>{returnError(error+servError)});
},
deleteOwner = (contentId, type, userId)=>{
    Loading();
    helperRequest(`${sData[1]}perm${sData[6]}?g=${contentId}&type=${type}&id=${userId}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            Z('perm'+userId).remove();
        })
        .catch((error)=>{returnError(error+servError)});
},// ###END_REGION

// ###PUBLIC_RENDER_REGION
LISTrender = (parsedData, joinData = '')=>{

    let html = '',
        count = 0,
        gdpsData = null,
        id = null,
        title = null,
        gdpsId = null,
        isActive = null;
    
    for (let Id in parsedData) {
        count++;
        if (count == 9)
            return html;
        
        gdpsData = parsedData[Id],
        id = gdpsData[0],
        title = gdpsData[1],
        gdpsId = gdpsData[2],
        isActive = gdpsData[3];

        html += 
        `<div class=framegdps style=width:280px;height:150px>`+
            `<h2>${title}</h2>`+
            `<div class=likezone style=position:absolute;bottom:0px;right:8px>`+
                `<button data-trans="moreInfo" class=loginbtnGDPS style=margin-left:-2px;border-bottom-right-radius:16px onclick="pageDemon(${id})">${getTrans('moreInfo')}</button>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
DEMOrender = (parsedData)=>{
    let html = '',
        count = 0,
        gdpsData = null,
        id = null,
        title = null,
        youtube = null,
        picture = null,
        listId = null,
        toppos = null;

    for (let Id in parsedData) {
        if (Id == 'name') 
            continue;
        count++;
        if (count == 11) 
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        title = gdpsData[1];
        youtube = gdpsData[2];
        listId = gdpsData[3];
        toppos = gdpsData[4];

        if (youtube.includes('watch')) {
            picture = youtube.substring(youtube.indexOf('?v=')+3);
        } else if (youtube.includes('youtu.be')) {
            picture = youtube.substring(youtube.indexOf('be/')+3, youtube.indexOf('?'))
        }
    
        html += 
        `<div class=framegdps>`+
            `<h2>${title}</h2>`+
            
            `<div style=min-height:128px>`+
                `<img onerror="this.src='../imgs/empty.png'" src="https://i.ytimg.com/vi/${picture}/mqdefault.jpg" height=100px>`+
            `</div>`+
            `<div style=position:absolute;bottom:0;width:100%>`+
                `<div class="likezone" style=position:absolute;bottom:0;right:16px>`+
                `<button class=loginbtnGDPS data-trans="moreInfo" onclick="demonRecords(${id},0)">${getTrans('moreInfo')}</button>`+
                `<a class=loginbtnGDPS style=margin-left:-2px;border-bottom-right-radius:16px data-trans="youTube" href="${youtube}" target=_blank>${getTrans('youTube')}</a>`+
                `</div>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
renderComms = (parsedData, commtype = 0, dataForNextButton = '')=>{

    let commcount = 0,
        html = '',
        htmlFull = '',
        delBtn = '',

        gdpsData = null,
        id = null,
        username = null,
        text = null,
        userId = null,
        userrole = null,
        likes = null,
        date = null,
        nameColor = null;

    for (let ide in parsedData) {
        if (commcount == 10) {
            htmlFull = htmlFull + insertBtn(`helperComments(${dataForNextButton})`);
            return htmlFull;
        };
        commcount++;
    
        gdpsData = parsedData[ide];
        id = gdpsData[0];
        username = gdpsData[1];
        text = gdpsData[2];
        userId = gdpsData[3];
        userrole = gdpsData[4];
        likes = gdpsData[5];
        date = gdpsData[6];
        switch (userrole) {
            case 0:
                nameColor = 'white';
                break;
            case 1:
                nameColor = 'greenyellow';
                break;
            case 2:
                nameColor = 'yellow';
                break;
            case 3:
                nameColor = '#ffcc22';
                break;
        }

        delBtn = 
        `<button onclick="deleteComm(${id},${commtype})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img width=24px src="../imgs/trash.svg">`+
        `</button>`;
        
        html = 
        `<div class="framecomm" id=comm${id}>`+
            `<button style="border:none;background:none;margin:0;font-size:32px;font-weight:bold;color:${nameColor}"`+
            `onclick="otherProfile(${userId},lastUsed3)">${username}</button>`+
            `<p style="margin:0">${timeAgo(date)}</p>`+
            `<p>${text}</p>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCountComm${id}">${likes}</span>`+
                `<button onclick="sendLike(${id},${commtype},1)" id="like"></button>`+
                `<button onclick="sendDislike(${id},${commtype},1)" id="dislike"></button>`+
            `</div>`+
            (thisUser[1] == userId || thisUser[2] > 0 ? delBtn : '')+
        `</div>`;
    
        htmlFull = htmlFull + html;
    
        html = '';
    };
    if (htmlFull == '')
        return `<h1 data-trans="commsNone">${getTrans('commsNone')}</h1>`;
    return htmlFull;
},
timeAgo = (timestamp)=>{
    let timeDiff = Math.floor((Date.now() / 1000) - timestamp);

    if (timeDiff < 60) {
        return timeDiff + getTrans('timeAgo01');
    } else if (timeDiff < 3600) {
        let minutes = Math.floor(timeDiff / 60);
        let seconds = timeDiff % 60;
        return minutes + getTrans('timeAgo02') + seconds + getTrans('timeAgo03');
    } else if (timeDiff < 86400) {
        let hours = Math.floor(timeDiff / 3600);
        let minutes = Math.floor((timeDiff % 3600) / 60);
        return hours + getTrans('timeAgo04') + minutes + getTrans('timeAgo05');
    } else if (timeDiff < 604800) {
        let days = Math.floor(timeDiff / 86400);
        let hours = Math.floor((timeDiff % 86400) / 3600);
        return days + getTrans('timeAgo06') + hours + getTrans('timeAgo07');
    } else if (timeDiff < 2592000) {
        let weeks = Math.floor(timeDiff / 604800);
        let days = Math.floor((timeDiff % 604800) / 86400);
        return weeks + getTrans('timeAgo08') + days + getTrans('timeAgo09');
    } else if (timeDiff < 31536000) {
        let months = Math.floor(timeDiff / 2592000);
        let weeks = Math.floor((timeDiff % 2592000) / 604800);
        return months + getTrans('timeAgo10') + weeks + getTrans('timeAgo11');
    } else {
        return getTrans('timeAgo12');
    };
},// ###END_REGION

// ###OTHER_REGION
seePassword = ()=>{
    if (Z('LGpassword').type == 'password') {
        Z('LGpassword').type = 'text';
        Z('LGbtn').src = '../imgs/PSsee.svg';
    } else {
        Z('LGpassword').type = 'password';
        Z('LGbtn').src = '../imgs/PShide.svg';
    }
},

profileSwitcherPhone = (userId = thisUser[1], backButton = '')=>{
    let html = '';
    if (userId === thisUser[1]) {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"   class=loginbtn onclick="innerProfile(gProfileMini())"            >${getTrans('profile')}</button><br><br>`+
            (thisUser[5] ? `<button data-trans="DMlists" class=loginbtn onclick="getListsLevels()">${getTrans('DMlists')}</button><br><br>` : '')+
            `<br><br><button data-trans="back" class=loginbtn onclick="p(pageList())">${getTrans('back')}</button>`+
        `</div>`;
    } else {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile"   class=loginbtn onclick="otherProfileMini(${userId})"       >${getTrans('profile')}</button><br><br>`+
            `<br><br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`;
    };
    return html;
},

switchLangMenu = ()=>{
    let preLang = '';
    for (let lang in translateData) {
        preLang += 
        `<button onclick="switchLang('${lang}')" style="width:32px" class="emptybtn">`+
            `<img src="../imgs/${lang}.png" width=32px style="padding-bottom:6px">`+
        `</button>`;
    };
    return `<div id=switchHtmlLang2 style="position:absolute;top:-16px;left:40px;padding:8px;border:solid black 3px;border-radius:8px;background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLang = (lang = 32)=>{
    if (lang === 32) {
        if (!Z('switchHtmlLang2')) {
            Z('switchHtmlLang').insertAdjacentHTML('beforeend', switchLangMenu());
        } else {
            Z('switchHtmlLang2').remove();
        }
    } else {
        translateReplaceLang(lang);
        Z('switchHtmlLang2').remove()
    }
},

switchLoginMenu = (predrop)=>{
    if (thisUser[1] === 0)
        return loginPage();
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let preLang = '';
    preLang +=
    `<button style="width:80px" class="emptybtn" onclick="${predrop}p(profilePage())">`+
        `<span data-trans="profile">${getTrans('profile')}</span>`+
    `</button>`+
    `<button style="width:80px" class="emptybtn" onclick="${predrop}gLogout()">`+
        `<span data-trans="logout">${getTrans('logout')}</span>`+
    `</button>`;
    return `<div id=switchLogin2 style="position:absolute; bottom:-55px; right:0px; padding:8px; border:solid black 3px;border-radius:8px; background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLogin = (lang = 32, predrop)=>{
    if (lang === 32) {
        if (!Z('switchLogin2')) {
            Z('switchLogin').insertAdjacentHTML('beforeend', switchLoginMenu(predrop))
        } else {
            Z('switchLogin2').remove()
        }
    } else {
        Z('switchLogin2').remove()
    }
},

Loading = (stop = 0)=>{
    if (stop == 0)
        document.body.insertAdjacentHTML('beforeend',
            '<div data-trans="loading..." class=ALERT id=TheLoadingElem style=position:absolute><h1>' +
                getTrans('loading...') +
            '</h1></div>'
        );
    else 
        if (Z('TheLoadingElem'))
            Z('TheLoadingElem').remove();
},
linkCopy = (string)=>{
    navigator.clipboard.writeText(string)
        .then(()=>{})
        .catch((error)=>{returnError(error)});
    Z('1st').insertAdjacentHTML('beforeend',
        `<div class=ALERT id=CopyElem style=position:absolute><h1 data-trans="copied">${getTrans('copied')}</h1></div>`
    );
    setTimeout(()=>{
        Z('CopyElem').remove();
    }, 1000);
},
megaAlert = (text)=>{
    Z('1st').insertAdjacentHTML('beforeend',
        `<div class=ALERT id=alert style=position:absolute><h1 data-trans="${text}">${getTrans(text)}</h1></div>`
    );
    setTimeout(()=>{
        Z('alert').remove();
    }, 3000);
},

enterFormData = (form, sendPlace)=>{
    let formData = new FormData(form);
    let params = new URLSearchParams(formData).toString();

    Loading();
    helperRequest(`${sData[1]}${sendPlace}`, params)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        if (sendPlace.indexOf('?') !== -1)
            sendPlace = sendPlace.split('?')[0];
        switch (sendPlace) {
            case 'writeAlarm'+sData[6]:
                Z('F45').remove();
                break;
            case 'createList'+sData[6]:
                openList(data);
                Z('REPform').remove();
                break;
            case 'addLevel'+sData[6]:
                Z('REPform').remove();
                Z('mainInsert').insertAdjacentHTML('afterend',
                    `<tr>`+
                        `<td>${parsedData[0]}</td>`+
                        `<td id=title${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('list')},'${parsedData[1]}',0)">${parsedData[1]}</button></td>`+
                        `<td id=youtube${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('list')},'${parsedData[2]}',1)">${parsedData[2]}</button></td>`+
                        `<td id=top${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('list')},0,2)">0</button></td>`+
                        `<td>`+
                            `<button onclick="removeLevel(${formData.get('list')},${parsedData[0]})" class=loginbtn data-trans="delete">${getTrans('delete')}</button>`+
                        `</td>`+
                    `</tr>`
                )
                break;
            case 'addProgress'+sData[6]:
                Z('REPform').remove();

                Z('mainInsert').insertAdjacentHTML('afterend',
                    `<tr id=progress${parsedData[0]}>`+
                        `<td>${parsedData[0]}</td>`+
                        `<td id=authorid${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('levelid')},'${parsedData[2]}','authorid')">${parsedData[2]}</button></td>`+
                        `<td id=authorname${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('levelid')},'${parsedData[3]}','authorname')">${parsedData[3]}</button></td>`+
                        `<td id=progress${parsedData[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${parsedData[0]},${formData.get('levelid')},'${parsedData[4]}','progress')">${parsedData[4]}</button></td>`+
                        `<td><button onclick="removeProgress(${formData.get('levelid')},${parsedData[0]})" class=loginbtn data-trans="delete">${getTrans('delete')}</button></td>`+
                    `</tr>`
                )
                break;
            default:
                let resp = JSON.parse(data);
                thisUser = resp[0];
                GDPSes = resp[1];
                Textures = resp[2];
                Guides = resp[3];
                myGdpses = [];
                mytextures = [];
                myGdpses.push(resp[4][0]);
                mytextures.push(resp[4][1]);
                p(profilePage());
        };
        return false;
    })
    .catch((error)=>{returnError(error+servError)});

    return false;
},// ###END_REGION

// ###PROFILE_PAGES_REGION
gProfileMini = ()=>{
    setLink('profile');
    let accStatus = thisUser[3] ? getTrans('isActive') : getTrans('isNotact');
    let html = 
    `<h1 data-trans="yourProf">${getTrans('yourProf')}</h1>`+
    `<p><span data-trans="profName">${getTrans('profName')}</span>: <span id=oldNick>${thisUser[0]}</span></p>`+
    `<button data-trans="edit" onclick="editNickPre()" class=loginbtn>${getTrans('edit')}</button>`+
    `<div style=position:relative id=newNick></div>`+
    `<p><span data-trans="profId"  >${ getTrans('profId') }</span>: ${thisUser[1]}</p>`+
    `<p><span data-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(thisUser[2])}</p>`+
    `<p><span data-trans="profAccs">${getTrans('profAccs')}</span> <span data-trans="${thisUser[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`+
    `<button data-trans="logout2" class=loginbtn onclick=gLogout()>${getTrans('logout2')}</button><br><br>`+
    `<button data-trans="getLogin" class=loginbtn onclick=getConfInfo()>${getTrans('getLogin')}</button><br><br>`+
    `<button data-trans="dropPass" class=loginbtn onclick="p(dropWindow())">${getTrans('dropPass')}</button>`;
    if (thisUser[2] !== 0) 
        html += 
    `<br><br><button class=loginbtn onclick="adminPanel()">Admin Panel!!1</button>`;
    return html;
},
toStringRole = (id)=>{
    switch (id) {
        case 0: return getTrans('role00');
        case 1: return getTrans('role01');
        case 2: return getTrans('role02');
        case 3: return getTrans('role03');
    };
},
alarmsWindow = ()=>{
    let html = 
    `<div align=center>`+
        `<h1 data-trans="alarms01">${getTrans('alarms01')}</h1>`+
        `<div style="display:flex">`+
            `<div style="width: 30%;  height: 400px;">`+
                `<h2 data-trans="msgs">${getTrans('msgs')}</h2>`+
                `<div id=alarms_small>`+
                `</div>`+
            `</div>`+
            `<div style="width: 70%;  height: 400px;">`+
                `<h2 data-trans="fullMsgs">${getTrans('fullMsgs')}</h2>`+
                `<div id=alarms_big>`+
                `</div>`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
getAlarms = (page = 0)=>{
    setLink('alarms');
    Loading();
    helperRequest(`${sData[0]}getAlarms${sData[6]}?page=${page}`)
    .then(data => {
        Loading(1);
        if (data == '[]') 
            return Z('alarms_small').innerHTML = `<span data-trans="newsNone">${getTrans('newsNone')}</span>`;
        let parsedData = JSON.parse(data);
        let html = '';
        parsedData.forEach(el => {
            html += `<button id="btn${el[0]}" class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
        });
        Z('alarms_small').innerHTML = html;
    })
    .catch((error)=>{returnError(error+servError)});
},
getFullAlarm = (id)=>{
    setLink('alarm='+id);
    Loading();
    helperRequest(`${sData[0]}getAlarm${sData[6]}?id=${id}`)
    .then(data => {
        Loading(1);
        let alarm = JSON.parse(data);
        let html = 
        `<div id=fullAlarm align=left style=margin-left:12px>`+
            `<h1>${alarm.title}</h1>`+
            `<p>${alarm.text}</p>`+
            `<span data-trans=""addedBy>${getTrans('addedBy')}</span> - `+
            `<button class=emptybtn onclick="otherProfile(${alarm.adminId},'profilePage()')">${alarm.adminName}</button><br><br>`+
            `<button data-trans="delete" class=loginbtn onclick="removeAlarm(${alarm.ID})">${getTrans('delete')}</button>`+
        `</div>`;
        Z('alarms_big').innerHTML = html;
    })
    .catch((error)=>{returnError(error+servError)});
},
dropWindow = ()=>{
    let html = pHeader()+
    `<div class="frameprofile" style="width:10vw%">`+
        `<h1 data-trans="passReset">${getTrans('passReset')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login04" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login04')}"><br><br>`+
        `<input data-trans="login05" id="LGemail"    class="framelabel" required placeholder="${getTrans('login05')}"><br><br>`+
        `<p data-trans="passResetIf">${getTrans('passResetIf')}</p>`+
        `<button data-trans="submit" class=loginbtn onclick="sendDrop()">${getTrans('submit')}</button><br><br>`+
        `<button data-trans="back" class=loginbtn onclick="p(profilePage())">${getTrans('back')}</button>`+
    `</div>`;
    return html;
},

otherProfileMini = (userId)=>{
    setLink('profiles='+userId);
    Loading();
    helperRequest(`${sData[0]}getUser${sData[6]}?id=${userId}`)
    .then(data => {
        Loading(1);
        let userData = JSON.parse(data);
        let accStatus = userData[3] ? getTrans('isActive') : getTrans('isNotact');
        let html = 
        `<h1><span data-trans="notYourProf">${getTrans('notYourProf')}</span> ${userData[0]}</h1>`+
        `<p><spandata-trans="profName">${getTrans('profName')}</span>: ${userData[0]}</p>`+
        `<p><spandata-trans="profId">${   getTrans('profId') }</span>: ${userData[1]}</p>`+
        `<p><spandata-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(userData[2])}</p>`+
        `<p><span data-trans="notProfAccs">${getTrans('notProfAccs')}</span> ${userData[0]} <span data-trans="${userData[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},// ###END_REGION

// ###LISTS_REGION
getListsLevels = (page = 0)=>{
    setLink('lists');
    innerProfile('');
    Loading();
    helperRequest(`${sData[3]}lists${sData[6]}?g=${thisUser[5]}&page=${page}`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        let html = `<h1 data-trans="DMlists">${getTrans('DMlists')}</h1><br>`;
        for (let Id in parsedData) {
            let el = parsedData[Id];
            html += 
            `<div  id="list${el[0]}" class=framegdps style=width:280px;height:150px>`+
                `<h1 style=margin:0>${el[1]}</h1>`+
                `<button class=loginbtn onclick="removeList(${el[0]})" style="position:absolute;top:8px;right:8px;padding:2px 4px">`+
                    `<img style="margin:0 0 3px 0" width=24px src="../imgs/trash.svg">`+
                `</button>`+
                `<div class=likezone style="position:absolute;bottom:0px;right:8px">`+
                    `<button data-trans=edit class=loginbtn onclick="openList(${el[0]})">${getTrans('edit')}</button>`+
                `</div>`+
            `</div>`;
        };
        html += `<button id="btncreate" class=loginbtn onclick="makeList()">+</button>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
openList = (id, page = 0)=>{
    setLink('list='+id);
    innerProfile('');
    Loading();
    helperRequest(`${sData[3]}demons${sData[6]}?list=${id}&page=${page}`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        let actList = ``;
        let html = `<h1 data-trans="DMlist">${getTrans('DMlist')}</h1><br><table id=insertable>`;
        html += 
        `<tr id=mainInsert>`+
            `<th>ID</th>`+
            `<th>Title</th>`+
            `<th>Youtube</th>`+
            `<th>Top position</th>`+
            `<th>Actions</th>`+
        `</tr>`;
        for (let Id in parsedData) {
            if (Id == 'name') 
                continue;

            let el = parsedData[Id];

            let actList =
            `<button onclick="removeLevel(${id},${el[0]})" class=loginbtn data-trans="delete">${getTrans('delete')}</button>`+
            `<button onclick="openLevelTop(${id},${el[0]})" class=loginbtn data-trans="levTOP">${getTrans('levTOP')}</button>`;

            html += 
            `<tr id=demon${el[0]}>`+
                `<td>${el[0]}</td>`+
                `<td id=title${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${id},'${el[1]}','title')">${el[1]}</button></td>`+
                `<td id=youtube${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${id},'${el[2]}','youtube')">${el[2]}</button></td>`+
                `<td id=top${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${id},'${el[4]}','top')">${el[4]}</button></td>`+
                `<td>${actList}</td>`+
            `</tr>`;
        };
        html += `</table><br>`+
        `<p data-trans=DMnote>${getTrans('DMnote')}</p>`+
        `<button onclick="makeLevel(${id})" class=loginbtn>+</button>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
openLevelTop = (listId, levelId)=>{
    setLink('level='+levelId+'.'+listId);
    innerProfile('');
    Loading();
    helperRequest(`${sData[3]}level${sData[6]}?level=${levelId}&admin`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data);
        let html = `<h1>${parsedData.name}</h1><br>`+
        `<button onclick=openList(${listId}) class=loginbtn data-trans=back>${getTrans('back')}</button><br>`+
        `<br><table id=insertable>`;
        html += 
        `<tr id=mainInsert>`+
            `<th>ID</th>`+
            `<th>gdUserId</th>`+
            `<th>gdNickname</th>`+
            `<th>progress</th>`+
            `<th>Actions</th>`+
        `</tr>`;
        for (let Id in parsedData) {
            if (Id == 'name') 
                continue;

            let el = parsedData[Id];

            let actList =
            `<button onclick="removeProgress(${levelId},${el[0]})" class=loginbtn data-trans="delete">${getTrans('delete')}</button>`;

            html += 
            `<tr id=progress${el[0]}>`+
                `<td>${el[0]}</td>`+
                `<td id=authorid${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${levelId},'${el[2]}','authorid')">${el[2]}</button></td>`+
                `<td id=authorname${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${levelId},'${el[3]}','authorname')">${el[3]}</button></td>`+
                `<td id=progres${el[0]}><button class=emptybtn style=font-size:16px ondblclick="editDemon(${el[0]},${levelId},'${el[4]}','progres')">${el[4]}</button></td>`+
                `<td>${actList}</td>`+
            `</tr>`;
        };
        html += `</table><br>`+
        `<p data-trans=DMnote>${getTrans('DMnote')}</p>`+
        `<button onclick="makeProgress(${levelId})" class=loginbtn>+</button>`;
        innerProfile(html);
    })
    .catch((error)=>{returnError(error+servError)});
},
demonRecords = (levelId, page)=>{
    if (Z('nextGdps'))
        Z('nextGdps').remove()
    setLink('records='+levelId);
    Loading();
    helperRequest(`${sData[3]}records${sData[6]}?level=${levelId}&page=${page}`)
        .then((data => {
            Loading(1);
            let parsedData = JSON.parse(data);
            let level = parsedData.levelData;
            let html = `<div class=gdps-list>${DEMOrender({"level":level})}</div>`;

            html += `<div style=display:flex class=framegdpsold>`+
                `<table>`+
                `<tr>`+
                    `<td style="border:solid gray 2px">`+
                        `<p style=margin:4px>Nickname</p>`+
                    `</td>`+
                    `<td style="border:solid gray 2px">`+
                        `<p style=margin:4px>Progress</p>`+
                    `</td>`+
                `</tr>`
            for (let Id in parsedData) {
                if (Id == 'levelData') 
                    continue;
    
                let el = parsedData[Id];

                html += 
                `<tr>`+
                    `<td style="border:solid gray 2px">`+
                        `<p style=margin:4px>${el[3]}</p>`+
                    `</td>`+
                    `<td style="border:solid gray 2px">`+
                        `<p style=margin:4px>${el[4]}</p>`+
                    `</td>`+
                `</tr>`;
            };
            html += `</table>`+
            `</div>`;
            innerGdpsPlace(html);
        }))
        .catch((error)=>{returnError(error+servError)});
},
removeList = (id)=>{
    Loading();
    helperRequest(`${sData[4]}list${sData[6]}?list=${id}`)
    .then(data => {
        Loading(1);
        Z(`list${data}`).remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
makeList = ()=>{
    let html = 
    `<div class=framemenu id=REPform style=width:220px>`+
        `<h1 data-trans="DMcreate">${getTrans('DMcreate')}</h1>`+
        `<form onsubmit="return enterFormData(this,'createList${sData[6]}')">`+
            `<input name=gdps value="${thisUser[5]}" type=hidden>`+
            `<input data-trans="guides02" placeholder="${getTrans('guides02')}" class=framelabel name=title><br>`+
            `<button data-trans="otmena" onclick="Z('REPform').remove()" class=loginbtn>${getTrans('otmena')}</button>`+
            `<input data-trans="DMcreate2" type=submit value=${getTrans('DMcreate2')} class=loginbtn>`+
        `</form>`+
    `</div>`;
    Z('1st').insertAdjacentHTML('beforeend', html);
},
makeLevel = (listId)=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div class="upperWindow frameprofile ANIM-create2" id=REPform style=width:300px>`+
            `<h1 data-trans="DMlevel">${getTrans('DMlevel')}</h1>`+
            `<form id=formLINK onsubmit="return enterFormData(this,'addLevel${sData[6]}')">`+
                `<input name=list value="${listId}" type=hidden>`+
                `<input data-trans="gdpsName" placeholder="${getTrans('gdpsName')}" class=framelabel name=title><br><br>`+
                `<input data-trans="youtube" placeholder="${getTrans('youtube')}" class=framelabel name=youtube><br><br>`+
                `<button data-trans="otmena" onclick="Z('formLINK').setAttribute('onsubmit','return false');closeWindow('REPform')" class=loginbtn>${getTrans('otmena')}</button>`+
                `<input data-trans="guides03" type=submit value=${getTrans('guides03')} class=loginbtn>`+
            `</form>`+
        `</div>`+
    `</div>`;
    Z('1st').insertAdjacentHTML('beforeend', html);
},
removeLevel = (listId, id)=>{
    Loading();
    helperRequest(`${sData[4]}demon${sData[6]}?id=${id}&list=${listId}`)
    .then(data => {
        Loading(1);
        Z(`demon${data}`).remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
makeProgress = (levelId)=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div class="upperWindow frameprofile ANIM-create2" id=REPform style=width:300px>`+
            `<h1 data-trans="DMlevel">${getTrans('DMlevel')}</h1>`+
            `<form id=formLINK onsubmit="return enterFormData(this,'addProgress${sData[6]}')">`+
                `<input name=levelid value="${levelId}" type=hidden>`+
                `<input data-trans="authorid" placeholder="${getTrans('authorid')}" class=framelabel name=authorid><br><br>`+
                `<input data-trans="authorname" placeholder="${getTrans('authorname')}" class=framelabel name=authorname><br><br>`+
                `<input data-trans="progress" placeholder="${getTrans('progress')}" class=framelabel name=progress><br><br>`+
                `<button data-trans="otmena" onclick="Z('formLINK').setAttribute('onsubmit','return false');closeWindow('REPform')" class=loginbtn>${getTrans('otmena')}</button>`+
                `<input data-trans="guides03" type=submit value=${getTrans('guides03')} class=loginbtn>`+
            `</form>`+
        `</div>`+
    `</div>`;
    Z('1st').insertAdjacentHTML('beforeend', html);
},
removeProgress = (levelId, id)=>{
    Loading();
    helperRequest(`${sData[4]}progress${sData[6]}?id=${id}&level=${levelId}`)
    .then(data => {
        Loading(1);
        Z(`progress${data}`).remove();
    })
    .catch((error)=>{returnError(error+servError)});
},
editDemon = (id, listId, oldValue, tabIndex, type = 0)=>{
    let tabString = tabIndex;

    if (type == 0) {
        Z(tabString+id).innerHTML = 
        `<div style=width:80px>`+
            `<input id=${tabString}Edit${id} style=color:black;width:220px value="${oldValue}">`+
            `<button onclick="editDemon(${id},${listId},'${oldValue}','${tabIndex}',1)" style="padding:1px 4px" class=loginbtn>✔</button>`+
            `<button onclick="editDemon(${id},${listId},'${oldValue}','${tabIndex}',2)" style="padding:2px 5px" class=loginbtn>X</button>`+
        `</div>`;
    } else if (type == 2) {
        Z(tabString+id).innerHTML = `<button class="emptybtn" style="font-size:16px" ondblclick="editDemon(${id},${listId},'${oldValue}','${tabIndex}')">${oldValue}</button>`;
    } else {
        let newTopValue = Z(tabString+'Edit'+id).value;
        helperRequest(`${sData[1]}${tabString}Edit${sData[6]}?demon=${id}&list=${listId}&topvalue=${newTopValue}`)
            .then(data => {
                Z(tabString+id).innerHTML = `<button class="emptybtn" style="font-size:16px" ondblclick="editDemon(${id},${listId},'${data}','${tabIndex}')">${data}</button>`;
            })
            .catch((error)=>{returnError(error+servError)});
    }
},
closeWindow = (windowId)=>{
    Z('blackEffect').classList.replace('ANIM-create1', 'ANIM-stop1');
    if (Z(windowId))
        Z(windowId).classList.replace('ANIM-create2', 'ANIM-stop2');
    
    timeout[1] = setTimeout(() => {
        Z('blackEffect').remove();
    },300)
};// ###END_REGION

let 
token = localStorage.getItem('helperUser'), // токен юзера
// isLogged = 0, // есть вход в аккаунт или нету, заменена на условие "thisUser[1] === 0"
thisUser = [
    '???', // ник
    0, // айди
    0, // роль
    0, // активирован или нет
    0, // есть ли алармы или нет
    0, // айди гдпса если есть право соовнера

    // дальше тут 2 переменных отвечают за ссылку на дискорд[6] и титл в сетлинке[7]
    'discord',
    'gdps'
    // обычно тут временно хранится токен
],
mainLang = localStorage.getItem('helperLang'), // язык, хотя вроде очевидно
servError = "\n\nSERVER RESP:\n\n  +xhr.response", // если 'helperRequest' вернёт ошибку, она будет записана сюда и отображена через 'returnError()'

DemonLists = [],
Demons = [],

ignore = false, // работает с функцией 'setLink', если true то сохранение состояния в истории вкладок не будет

timeout = [null,null];

if (!localStorage.getItem('helperLang') || localStorage.getItem('helperLang') == 'Ru') {
    mainLang = 'RU';
    localStorage.setItem('helperLang', 'RU');
};

window.addEventListener('popstate', ()=>{
    ignore = true;
    getLink();
});

window.addEventListener('input', function() {
    let input = Z('framelabel').value
    clearTimeout(timeout[0]);
    if (input != '') {
        timeout[0] = setTimeout(() => {
            sendFinder();
        }, 300);
    }
});

reStart();