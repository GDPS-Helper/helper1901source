// ГАЙД ПО МИНИФИКАЦИИ - getElement() это обычный док гет элембуид. innerMain() это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 *  вызывается функция 'reStart()', которая вызывает 'helperRequest()' но это мелочи, она назначает глобальные переменные GDPSes и Guides
 *  если есть вход в аккаунт назначаются ещё и thisUser, myGdpses и myguides
 *  после вызывается функция 'getLink()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 *  после выполнения 'getLink()' хелпер готов к работе с клиентом
 */

/* рефакторинг 14-15 сентября
 * задача - переструкторировать гдпс хелпер так чтобы код выглядел более читаемым
 * первое - поставить жизненно важные переменные в начало, выполнено
 * мимолётно был прокомментирован некоторый код
 * второе - расставить всё по регионам, инсерты, прочий мусор, гайды, прочий контент, ибо гайды отличаются сильно, выполнено
 */

const getElement = (i) => {
    if (!document.getElementById(i))
        console.error('Cant find element with "'+i+'" id!');
    return document.getElementById(i);
},

helperBuildNum = 81,
helperStrVer = '1.901',
baseColor = '#ff8600',
ignoreCap = false,
Slocal = localStorage;

baseApp = location.origin + location.pathname.slice(0,location.pathname.lastIndexOf('/')+1),

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
        let XHR = new XMLHttpRequest(),
            METHOD = 'GET';
        if (data !== '') 
            METHOD = 'POST';

        XHR.open(METHOD, url);
        XHR.onreadystatechange = ()=>{
            if (XHR.readyState === 4 && XHR.status === 200) {
                servError = "\n\nSERVER RESP:\n\n"+XHR.response;
                resolve(XHR.response);
            }
            if (XHR.status === 404)
                reject(new Error('404 not found'), XHR);
        };
        // .catch((error)=>{console.error(error);returnError(error+servError)})
        XHR.onerror = ()=>{
            reject(new Error('Network error'), XHR);
        };

        if (data !== '') {
            XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            XHR.send(data);
        } else {
            XHR.send();
        };
    });
},
// отображение ошибок у 'helperRequest', переменная errorCount нужна чтобы считать ошибки
returnError = (err)=>{
    console.error(err);
    errorCount++;
    document.body.insertAdjacentHTML('beforeend',
        `<div class=ALERT id=debug${errorCount}>`+
            `<p align=center style=margin:0>DEBUG INFO</p>`+
            `<pre style=background-color:#000>`+
                `LOCATION: ${location}\n`+
                `USERID: ${thisUser[1]}`+
            `</pre>`+
            `ERROR<br>`+
            `<div id=debugMega${errorCount} style=background-color:#000></div>`+
            `<br><br>`+
            `<center>`+
                `<button style=background-color:#333 onclick="location.reload()">`+
                    `FULL RESTART`+
                `</button>`+
                `<button style=background-color:#333 onclick=reStart(0,${errorCount})>`+
                    `RESTART`+
                `</button><br>`+
                `<button style=background-color:#333 onclick=linkCopy(getElement('debug').innerText)>`+
                    `COPY ERROR`+
                `</button>`+
                `<button style=background-color:#333 onclick=getElement('debug${errorCount}').remove()>`+
                    `HIDE ERROR`+
                `</button>`+
            `</center>`+
        `</div>`
    );
    getElement('debugMega'+errorCount).innerText = err;
    if (getElement('TheLoadElem'))
        getElement('TheLoadElem').remove();
},
setLink = (val, pageTitle = 'GDPS Helper')=>{
    if (!ignore) {
        history.pushState(null, null, '#'+val);
    }
    if (pageTitle)
        document.querySelector('title').innerHTML = pageTitle;
    ignore = false;
},
getLink = ()=>{
    // там где /// там профильные функции, нужно сделать там innerMain(pageList())
    let actions = {
        '': ()=>                {innerMain(pageMain())},
        list: ()=>              {innerMain(pageList())},
        en: ()=>                {translateReplaceLang('EN',1);innerMain(pageList())},
        ru: ()=>                {translateReplaceLang('RU',1);innerMain(pageList())},
        gdps: (gdpsId)=>        {helperContent('gdps', gdpsId)},
        news: (gdpsId)=>        {helperNews(gdpsId)},
        newsC: (postId)=>       {helperContent('newsC',postId.split('.')[0],postId.split('.')[1])},
        special: ()=>           {innerMain(uvazuha())},
        about: ()=>             {innerMain(helperAbout())},
        profile: ()=>           {innerMain(profilePage())},
        addedGdpses: ()=>       {innerMain(profilePage(gdpsesWindow()))},
        addedGuides: ()=>       {innerMain(profilePage(guidesWindow()))},
        addGdps: ()=>           {innerMain(profilePage(addGdps()))},
        editGdps: (gdpsId)=>    {innerMain(profilePage(editGdps(gdpsId)))},
        alarms: ()=>            {innerMain(profilePage(alarmsWindow()));GetAlarms()},
        alarm: (msgId)=>        {innerMain(profilePage(alarmsWindow()));getFullAlarm(msgId)},
        profiles: (userId)=>    {otherProfile(userId,'innerMain(pageList())')},
        profGdpses: (userId)=>  {otherProfile(userId,'innerMain(pageList())',otherGdpsesWindow)},
        profGuides: (userId)=>  {otherProfile(userId,'innerMain(pageList())',otherGuidesWindow)},
        guides: ()=>            {gGuides()},
        guide: (guideId)=>      {GetGuide(guideId)},
        guideNew: ()=>          {newGuide()},
        guideEdit: (guidId)=>   {editGuide(guidId)},

        gdpsLog: (gdpsId)=>     {innerMain(profilePage());getJoinLog(gdpsId)},
        gdpsOwn: (gdpsId)=>     {innerMain(profilePage(coownersMenu(gdpsId,3)))},

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
    console.log(params);

    for (let KEY in params) {
        let VALUE = params[KEY];
        if (typeof KEY !== 'undefined') {
            if (typeof VALUE === 'undefined') {
                VALUE = thisUser[1];
            };
            try {
                actions[KEY](VALUE);
            } catch {
                returnError("#"+KEY+"="+VALUE+' is broken link!');
                innerMain(pageMain());
            }
        };
    };
},
getLinkOld = ()=>{
    // там где /// там профильные функции, нужно сделать там innerMain(pageList())
    let actions = {
        '': ()=>                {innerMain(pageMain())},
            list: ()=>          {innerMain(pageList())},
              en: ()=>          {translateReplaceLang('EN',1);innerMain(pageList())},
              ru: ()=>          {translateReplaceLang('RU',1);innerMain(pageList())},
        gdps: (gdpsId)=>        {helperContent('gdps', gdpsId)},
        news: (gdpsId)=>        {helperNews(gdpsId)},
        newsC: (postId)=>       {helperContent('newsC',postId.split('.')[0],postId.split('.')[1])},
        special: ()=>           {innerMain(uvazuha())},
        about: ()=>             {innerMain(helperAbout())},
        profile: ()=>           {innerMain(profilePage())},
        addedGdpses: ()=>       {innerMain(profilePage(gdpsesWindow()))},
        addedGuides: ()=>       {innerMain(profilePage(guidesWindow()))},
        addGdps: ()=>           {innerMain(profilePage(addGdps()))},
        editGdps: (gdpsId)=>    {innerMain(profilePage(editGdps(gdpsId)))},
        alarms: ()=>            {innerMain(profilePage(alarmsWindow()));GetAlarms()},
        alarm: (msgId)=>        {innerMain(profilePage(alarmsWindow()));getFullAlarm(msgId)},
        profiles: (userId)=>    {otherProfile(userId,'innerMain(pageList())')},
        profGdpses: (userId)=>  {otherProfile(userId,'innerMain(pageList())',otherGdpsesWindow)},
        profGuides: (userId)=>  {otherProfile(userId,'innerMain(pageList())',otherGuidesWindow)},
        guides: ()=>            {gGuides()},
        guide: (guideId)=>      {GetGuide(guideId)},
        guideNew: ()=>          {newGuide()},
        guideEdit: (guidId)=>   {editGuide(guidId)},

        gdpsLog: (gdpsId)=>     {innerMain(profilePage());getJoinLog(gdpsId)},
        gdpsOwn: (gdpsId)=>     {innerMain(profilePage(coownersMenu(gdpsId,3)))},

        admin: ()=>             {adminPanel()}
    };

    let params = window.location.search
        .replace('?','')
        .split('&')
        .reduce(
            (p,e)=>{
                let a = e.split('=');
                p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                return p;
            },
            {}
        );
    console.log(params);

    for (let KEY in params) {
        let VALUE = params[KEY];
        if (typeof KEY !== 'undefined') {
            if (typeof VALUE === 'undefined') {
                VALUE = thisUser[1];
            };
            try {
                actions[KEY](VALUE);
            } catch {
                returnError("#"+KEY+"="+VALUE+' is broken link!');
                innerMain(pageMain());
            }
        };
    };
},
reStart = (drop = 0, errorId = 0)=>{
    if (getElement('debug'+errorId))
        getElement('debug'+errorId).remove();
    innerMain('');
    let token = Slocal.getItem('helperUser'),
    postData = token ? 'token='+token : '';
    Loading();
    helperRequest(sData[2]+'loginT'+sData[6], postData)
        .then((data)=>{
            Loading(1);
            let serverResp = JSON.parse(data);
            CacheGDPSes = serverResp[1];
            CacheGuides = serverResp[2];
            if (postData !== '') {
                thisUser = serverResp[0];
                myGdpses = [];
                myguides = [];
                myGdpses.push(serverResp[3][0]);
                myguides.push(serverResp[3][1]);
            }
            if (window.location.search === '')
                getLink();
            else 
                getLinkOld();
        })
        .catch((error)=>{console.error(error);returnError(error)});
    if (drop !== 0) {
        ignore = true;
        translateReplaceLang('RU');
    }
},

// ###HELPERFIND_REGION. работа нового поиска без костылей
writeTag = (type,tag)=>{
    let INDEX = 1,
        elemId = 'GDtag';
    switch (type) {
        case 'gdps':
            INDEX = 1;
            break;
        case 'gdOS':
            INDEX = 2;
            break;
    };
    if (!helperFindData[INDEX].includes(tag)) {
        getElement(elemId+tag).setAttribute('class','tagSel');
        helperFindData[INDEX].push(tag);
    } else {
        getElement(elemId+tag).setAttribute('class','tagUns');
        let tagPlace = helperFindData[INDEX].indexOf(tag);
        if (tagPlace !== -1) {
            helperFindData[INDEX].splice(tagPlace, 1);
        }
    }
    helperFindData[INDEX].sort((a,b)=>{return a-b});
    sendFinder();
},
setMethod = (Method)=>{
    getElement('method'+helperFindData[0]).setAttribute('class','tagPre');
    helperFindData[0] = Method;
    getElement('method'+helperFindData[0]).setAttribute('class','tagSel');
    sendFinder();
},
sendFinder = (page = 0, zapros = '')=>{
    if (getElement('nextGdps'))
        getElement('nextGdps').remove();

    if (zapros === '') {
        zapros = 'method='+helperFindData[0];
        let enteredName = getElement('gdpsNameInput').value;
        if (enteredName != '')
            zapros += '&name='+enteredName;

        helperFindData[1].forEach(tag => {
            zapros += '&tags[]='+tag;
        });

        helperFindData[2].forEach(os => {
            zapros += '&os[]='+os;
        });
    }

    Loading();
    helperRequest(`${sData[3]}new${sData[6]}?${zapros}&page=${page}`)
        .then(data => {
            Loading(1);
            let GDPSES = JSON.parse(data),
                page2 = page + 1,
                nextBtn = `sendFinder(${page2},'${zapros}')`,
                
                Count = Object.keys(GDPSES).length;
            innerGdpsPlace(GDPSrenderMini(GDPSES), page);

            if (Count >= 9)
                innerGdpsPlace(insertBtn(nextBtn),-1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},

helperContent = (type, id, otherData = 0)=>{
    let commType = 0,
        backFunc = '';
    switch (type) {
        case 'gdps':
            lastUsed3 = "helperContent('gdps',"+id+")";
            backFunc = 'pageList())';
            setLink('gdps='+id);
            innerMain(GDPSpreload(`${id},0`, backFunc));
            break;
        case 'newsC':
            lastUsed3 = "helperContent('newsC',"+id+","+otherData+")";
            commType = 3;
            backFunc = `gdpsNewsPage(${otherData}));helperContent('gdps', ${otherData})`;
            setLink('newsC='+id+'.'+otherData);
            innerMain(contentPreload(`${id},${commType}`, backFunc));
            break;
    };
    Loading();
    helperRequest(`${sData[0]}${type}${sData[6]}?id=${id}`)
        .then((data)=>{
            if (data == '["NONE"]') {
                Loading(1);
                if (type == 'text')
                    innerMain(pageDemon());
                else
                    innerMain(pageList());
                megaAlert('CONTENTISNULL');
                return;
            }
            let dataForNextButton = `${id},'${type}',1`;

            Loading(1);
            let serverResp = JSON.parse(data),
                html = '';
            switch (type) {
                case 'gdps':
                    if (otherData !== 0)
                        html = GDPSrender(serverResp, otherData);
                    else 
                        html = GDPSrender(serverResp);
                    innerComments(renderComms(serverResp.comments,3,dataForNextButton), 0);
                    getElement('news').innerHTML = RenderNews(serverResp.news,0,'mini');
                    renderStat(serverResp.gdpsstat);
                    break;
                case 'newsC':
                    html = RenderNews(serverResp.gdps,1);
                    innerComments(renderComms(serverResp.comments,5,dataForNextButton), 0);
                    break;
            };
            getElement('insertable').innerHTML = html;
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
helperComments = (postId, contentType, commPage = 0)=>{
    getElement('nextGdps').remove();
    let typeC = 0,
        dataForNextButton = `${postId},'${contentType}',${parseInt(commPage + 1)}`;
    switch (contentType) {
        case 'gdps':    contentType = 0; typeC = 3;    break;
        case 'text':    contentType = 1; typeC = 4;    break;
        case 'guid':    contentType = 3; typeC = 6;    break;
        case 'news':    contentType = 2; typeC = 5;    break;
        case 'newsC':   contentType = 2; typeC = 5;    break;
    };
    Loading();
    helperRequest(`${sData[0]}fetchComms${sData[6]}?id=${postId}&type=${contentType}&page=${commPage}`)
        .then((data)=>{
            Loading(1);
            let serverResp = JSON.parse(data);
            innerComments(renderComms(serverResp,typeC,dataForNextButton), 1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
helperNews = (gdpsId)=>{
    innerMain(gdpsNewsPage(gdpsId));
    Loading();
    helperRequest(`${sData[0]}news${sData[6]}?id=${gdpsId}`)
        .then(data => {
            setLink('news='+gdpsId);
            Loading(1);
            if (data == '{}') {
                innerGdpsPlace(`<h1>${getTrans('newsNone')}</h1>`, 1);
            } else {
                let parsedData = JSON.parse(data);
                innerGdpsPlace(RenderNews(parsedData,5,''));
            };
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},

getGuides = (page)=>{
    if (getElement('nextGdps'))
        getElement('nextGdps').remove();

    Loading();
    helperRequest(`${sData[0]}getGuides${sData[6]}?page=${page}`)
        .then(data => {
            Loading(1);
            let parsedData = JSON.parse(data),
                page2 = page++,
                html = renderGuideMini(parsedData, page2);
            innerGuides(html);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
GetGuide = (id)=>{
    let html = pHeader()+
        `<h1 id=title></h1>`+
        `<div id=texts></div>`+
        `<div data-trans=back class=gdps-forum><button class=loginbtn onclick="gGuides()">${getTrans('back')}</button></div>`+
        `<div align=center style="margin:8px">`;
            if (thisUser[1] !== 0) {
                html +=
            `<div class="framemain" style="height:60px">`+
                `<p style="margin:0">`+
                    `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
                    `${thisUser[0]}`+
                `</p>`+
                `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
                `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${id},2)" id="commentBtn">${getTrans('commSend')}</button>`+
            `</div>`;
            };
        html +=
            `<div id=comments>`+
            `</div>`+
        `</div>`;
    innerMain(html);
    Loading();
    helperRequest(`${sData[0]}getGuide${sData[6]}?id=${id}`)
    .then(data => {
        if (data == '["NONE"]') {
            Loading(1);
            gGuides();
            megaAlert('CONTENTISNULL');
            return;
        }
        setLink('guide='+id);
        Loading(1);
        let parsedData = JSON.parse(data),
            guideinfo = parsedData['guideinfo'],
            guidedata = parsedData['guidedata'],
            Comms = parsedData['comments'],
            html = '';
        getElement('title').innerHTML = guideinfo[1];
        if (guideinfo[3])
            getElement('title').insertAdjacentHTML('afterend', guideinfo[2]);

        guidedata.forEach(val => {
            html +=
            `<div class=frameguide>`+
                `<h2>${val[0]}</h2>`+
                `${Markdown(val[1])}`+
            `</div><br>`;
        });
        html += guideinfo[2];

        getElement('texts').innerHTML = html

        getElement('comments').insertAdjacentHTML('beforeend',
        renderComms(Comms,6,`${id},'guid',1`));
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},// ###END_REGION

// ###TRANSLATE_REGION. перевод "Налету", пожалуйста, не трогайте то что есть, я уже не помню за что какое значение отвечает
translateData = {
    RU: {
        'helperVer':'ver - '+helperStrVer+' <span style=opacity:50%>(BUILD '+helperBuildNum+')</span>',
        'src':'./imgs/RU.png',
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
        'search':'ГДПСы',
        'findByName':'Найдите по названию',
        'gdpsName':'Название ГДПС',
        'listHelp1':'если вы ищете гдпс которого нету в листе то добавьте его! но перед этим зарегистрируйтесь',
        'tags00':'Выберите теги',
        'os00':'Платформа',
        'otherSort':'Метод поиска',
        'addGdps':'Добавить ГДПС',
        'addGdps01':'Название:',
        'addGdps02':'Описание:',
        'addGdps03':'Ссылка на ГДПС:',
        'addGdps03a':'Ссылка на ГДПС (только дискорд)',
        'addGdps03b':'Новая ссылка',
        'addGdps04':'Аватар ГДПС:',
        'addGdps05':'Тэги <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько тегов)</span>:',
        'addGdps06':'ОС <span style=opacity:50%>(Windows: зажмите CTRL чтобы добавлять несколько ОС)</span>:',
        'afterGD':'После изменения ваш гдпс будет забанен <span style=opacity:50%>(если ранее был подтверждён)</span>',
        'editGdps':'Изменить ГДПС',
        'editLink':'Обновить ссылку входа',
        'gdpsInput01':'Название этого ГДПС',
        'gdpsInput02':'Описание этого ГДПС',
        'gdpsInput03':'http://www.boomlings.com/tools ИЛИ http://gofruit.space/gdps/XXXX',
        'gdpsInput04':'Прямая ссылка на картинку',
        'gdpsInput05':'https://discord.gg/gdps',
        'special00':'Благодарит этих людей',
        'special01':'Создание "майского билда"',
        'special02':'Gdps helper Archive',
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
        'yourGuides':'Ваши Гайды',
        'alarms01':'Сообщения от администрации',
        'msgs':'Сообщения',
        'fullMsgs':'Полный текст',
        'role00':'Нет',
        'role01':'Менеджер',
        'role02':'Админ',
        'role03':'Главный Админ',
        'GDPSstatus10':'Статус сервера: Не работает',
        'GDPSstatus00':'Статус сервера: Проверка не запускалась',
        'GDPSstatus01':'Статус сервера: Работает',
        'weekGdps':'ГДПС Недели',
        'addedBy':'Автор',
        'moreInfo':'Подробнее',
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
        'guides02':'Название гайда',
        'guides03':'Добавить раздел',
        'guides04':'Послесловие (например кто автор)',
        'guides05':'Картинка (формат 2:1)',
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
        'bumped':'Бампнуто!',
        'gdpsunckecked':'ГДПС не проверен',
        'gdpsbanned':'ГДПС забанен',
        'newPost':'Новый пост',
        'didntBan':'Ваш ГДПС не будет забанен',
        'T1-createdForHelp':'Создан чтобы помогать',
        'T1-findAbout':'Как найти гдпс?',
        'T1-insertAbout':'Как добавить гдпс?',
        'T1-findHelp':'Зайдите на страницу поиска, если хотите выберите теги и платформу, и выберите нужный метод поиска. Поиск автоматически реагирует на изменения. Если вы хотите найти гдпс по имени советуем убрать все теги',
        'T1-insertHelp':'Для этого вам необходимо зарегистрировать аккаунт, после зайти в профиль и уже там нажать на "Ваши ГДПСы", дальше нажать на кнопку "Добавить ГДПС" и заполнить форму, после этого вам остаётся ждать подтверждения вашего гдпса (обычно в 10-18 по МСК оно занимает не больше часа)',
        'T2-promo1':'Ищешь ГДПС?',
        'T2-promo2':'У нас очень удобный поиск, а также широкий выбор среди приватных серверов!',
        'T2-promo3':'Хочешь добавить гдпс?',
        'T2-promo4':'С GDPS Helper это возможно! Бесплатная реклама, мощные инструменты продвижения и море новых пользователей – все это ждет тебя на нашем сервисе!',
        'T2-func1':'Открыть поиск',
        'demons':'Демонлист',
    },
    EN: {
        'helperVer':'ver - '+helperStrVer+' <span style=opacity:50%>(BUILD '+helperBuildNum+')</span>',
        'src':'./imgs/EN.png',
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
        'search':'GDPSes',
        'findByName':'Find by name',
        'gdpsName':'GDPS name',
        'listHelp1':'If you are looking for a gdps that isnt in the list, then add it! But before that, register',
        'tags00':'Select tags',
        'os00':'Platform',
        'otherSort':'Search method',
        'addGdps':'Add GDPS',
        'addGdps01':'Title:',
        'addGdps02':'Description:',
        'addGdps03':'Link to GDPS:',
        'addGdps03a':'Link to GDPS (discord only)',
        'addGdps03b':'New link',
        'addGdps04':'GDPS Avatar:',
        'addGdps05':'Tags <span style=opacity:50%>(Windows: hold down CTRL to add multiple tags)</span>:',
        'addGdps06':'OS <span style=opacity:50%>(Windows: hold down CTRL to add multiple OS)</span>:',
        'afterGD':'After edit, your gdps will be banned <span style=opacity:50%>(if previously verified)</span>',
        'editGdps':'Edit GDPS',
        'editLink':'Refresh join link',
        'gdpsInput01':'GDPS name',
        'gdpsInput02':'GDPS description',
        'gdpsInput03':'http://www.boomlings.com/tools OR http://gofruit.space/gdps/XXXX ',
        'gdpsInput04':'Direct link to picture',
        'gdpsInput05':'https://discord.gg/gdps',
        'special00':'Thanks these people',
        'special01':'"May build" development',
        'special02':'Gdps helper Archive',
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
        'yourGuides':'Your Guides',
        'alarms01':'Messages by administration',
        'msgs':'Messages',
        'fullMsgs':'Full text',
        'role00':'No',
        'role01':'Manager',
        'role02':'Admin',
        'role03':'Head Admin',
        'GDPSstatus10':'Server Status: Not working',
        'GDPSstatus00':'Server status: check didn\'t started',
        'GDPSstatus01':'Server Status: Working',
        'weekGdps':'Weekly GDPS',
        'addedBy':'Author',
        'moreInfo':'Learn more',
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
        'guides02':'Guide Title',
        'guides03':'Add Section',
        'guides04':'Afterword (such as who the author)',
        'guides05':'Picture (2:1 format)',
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
        'bumped':'Bumped!',
        'gdpsunckecked':'GDPS not checked',
        'gdpsbanned':'GDPS banned',
        'newPost':'New post',
        'didntBan':'your gdps won\'t be banned',
        'T1-createdForHelp':'Created to help',
        'T1-findAbout':'How to find gdps?',
        'T1-insertAbout':'How to add gdps?',
        'T1-findHelp':'Go to the search page, select tags and platform if you want, and select the desired search method. The search will automatically respond to changes. If you want to search for gdps by name we advise you to remove all tags',
        'T1-insertHelp':'To do this, you need to register an account, then go to your profile and then click on "Your GDPSes", then click on "Add GDPS" and fill out the form, then you have to wait for the confirmation of your GDPS (usually at 10-18 AM in GMT+3 it takes no more than an hour)',
        'T2-promo1':'Looking for GDPS?',
        'T2-promo2':'We have a very convenient search, and wide choice among private servers!',
        'T2-promo3':'Want to add GDPS?',
        'T2-promo4':'With GDPS Helper it is possible! Free advertising, powerful promotion tools and a sea of new users - all this is waiting for you on our service!',
        'T2-func1':'Open search',
        'demons':'Demonlist',
    }
},
getTrans = (id)=>{
    try {
        return translateData[mainLang][id];
    } catch (err) {
        mainLang = 'RU';
        Slocal.setItem('helperLang', 'RU');
        returnError(err);
    }
},
translateReplaceLang = (lang)=>{
    console.time(helperBuildNum);
    mainLang = lang;
    Slocal.setItem('helperLang', lang);
    document.querySelectorAll('[data-trans]').forEach((el)=>{
    let KEY = el.getAttribute('data-trans');
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'IMG') {
            el.innerHTML = translateData[lang][KEY];
        } else if (el.tagName !== 'IMG') {
            el.setAttribute('placeholder', translateData[lang][KEY]);
        } else {
            el.src = translateData[lang][KEY];
        };
    });
    console.timeEnd(helperBuildNum);
},// ###END_REGION

// ###INSERT_REGION. вставка в разные куски страницы, функция p упомянута тут, за остальные поясню ниже
innerMain = (textContent, insertType = 0)=>{
    if (!getElement('1st')) 
        return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
    if (insertType == 0) 
        getElement('1st').innerHTML = textContent;
    else 
        getElement('1st').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = (textContent)=>{
    if (getElement('profileWindow')) 
        getElement('profileWindow').innerHTML = textContent;
    else 
        return new Error('Cant find "profileWindow" element!');
},
// вставка контента под рамкой поиска
innerGdpsPlace = (textContent, insertType = 0)=>{
    if (!getElement('GDPSesPlace')) 
        return new Error('Cant find "GDPSesPlace" element!');
    if (insertType == 0) // профили
        getElement('GDPSesPlace').innerHTML = textContent;
    else if (insertType >= 1) // в поиске устарел
        getElement('GDPSesPlace').insertAdjacentHTML('beforeend', textContent);
    else 
        // в поиске но лучще это
        getElement('GDPSesPlace').insertAdjacentHTML('afterend', textContent);
},
// вставка контента в рамку комментариев, прошу обратить внимание ибо у гдпсов она справа, а у гайдов и текстур заполняет весь экран
innerComments = (textContent, insertType = 0)=>{
    if (!getElement('comments')) 
        return new Error('Cant find "comments" element!');
    if (insertType == 0) // при рендере гдпса
        getElement('comments').innerHTML = textContent;
    else 
        // а эт вроде когда "показать больше"
        getElement('comments').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в рамку гайдов, как попало если что
innerGuides = (textContent, insertType = 0)=>{
    if (!getElement('guidesPlace')) 
        return new Error('Cant find "guidesPlace" element!');
    if (insertType == 0)
        getElement('guidesPlace').insertAdjacentHTML('beforeend',textContent);
    else 
        getElement('guidesPlace').insertAdjacentHTML('afterend',textContent);
},// ###END_REGION

// ###PUBLIC_CONTENT_REGION
sendRegisterForm = ()=>{
    let username = getElement('LGusername').value,
        password = getElement('LGpassword').value,
        email    = getElement('LGemail'   ).value,
        hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha || ignoreCap) {
        Loading();
        helperRequest(
            `${sData[5]}register${sData[6]}`,
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
                    let serverResp = JSON.parse(data);
                    CacheGDPSes = serverResp[1];
                    CacheGuides = serverResp[2];
                    thisUser = serverResp[0];
                    myGdpses = [];
                    myguides = [];
                    myGdpses.push(serverResp[3][0]);
                    myguides.push(serverResp[3][1]);
                    dropLogin(1);
                    Slocal.helperUser = thisUser[5];
                    thisUser.pop();

                    getElement('regBtn').remove();
                    getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser[0]}</span>`;
            }
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendLoginForm = ()=>{
    let username = getElement('LGusername').value,
        password = getElement('LGpassword').value,
        hcaptcha = document.querySelector('[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    if (hcaptcha || ignoreCap) {
        Loading();
        helperRequest(
            `${sData[5]}login${sData[6]}`,
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
                    let serverResp = JSON.parse(data);
                    CacheGDPSes = serverResp[1];
                    CacheGuides = serverResp[2];
                    thisUser = serverResp[0];
                    myGdpses = [];
                    myguides = [];
                    myGdpses.push(serverResp[3][0]);
                    myguides.push(serverResp[3][1]);
                    dropLogin(1);
                    Slocal.helperUser = thisUser[5];
                    thisUser.pop();

                    getElement('regBtn').remove();
                    getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser[0]}</span>`;
            }
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
    } else {
        megaAlert('captchaDed');
    };
},
sendDrop = ()=>{
    let username = getElement('LGusername').value,
        password = getElement('LGpassword').value,
        email    = getElement('LGemail'   ).value;
    Loading();
    helperRequest(
        `${sData[5]}drop${sData[6]}`,
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
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
gLogout = ()=>{
    Loading();
    helperRequest(`${sData[5]}logout${sData[6]}`)
        .then(()=>{
            Loading(1);
            thisUser = ['???',0,0,0,0];
            Slocal.removeItem("helperUser");
            token = undefined;
            innerMain(pageMain());
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},

editNickPre = ()=>{
    getElement('newNick').innerHTML =
    `<input class="framelabel" id=newNick2 data-trans="newNick" placeholder="${getTrans('newNick')}">`+
    `<button data-trans="edit" onclick="editNick()" class=loginbtn>${getTrans('edit')}</button>`;
},
editNick = ()=>{
    let newNick = getElement('newNick2').value;
    helperRequest(`${sData[5]}setNickname${sData[6]}?name=${newNick}`)
        .then(data => {
            let timename = thisUser[0].slice();
            thisUser[0] = data;
            for (let gdpsKey in myGdpses[0]) 
                if (myGdpses[0][gdpsKey][7] == timename) 
                    myGdpses[0][gdpsKey][7] = data;

            // потом сделать во всех гдпсах и текстурах
            getElement('oldNick').innerHTML = data;
            getElement('newNick').innerHTML = '';
        })
},

sendLike = (id, channel, isComm = 0)=>{
    if (thisUser[1] === 0)
        return megaAlert('needLogin');

    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}like${sData[6]}`, data)
        .then((data)=>{
            if (!isComm)
                getElement('likesCount' + id).innerText = data;
            else 
                getElement('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
sendDislike = (id, channel, isComm = 0)=>{
    if (thisUser[1] === 0)
        return megaAlert('needLogin');
    
    Loading();
    let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
    helperRequest(`${sData[1]}dislike${sData[6]}`, data)
        .then((data)=>{
            if (!isComm)
                getElement('likesCount' + id).innerText = data;
            else 
                getElement('likesCountComm' + id).innerText = data;
            Loading(1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
sendComm = (id, channel)=>{
    if (thisUser[1] === 0)
        return;

    Loading();
    let preTye = '',
        typeC = 0;
    switch (channel) { // для того чтобы работали лайки, их айди сбит из-за того что 0-гдпсы, а 1-текстуры, ныне удалённые
        case 0:    typeC = 3;    break;
        case 2:    typeC = 6;    break;
        case 3:    typeC = 5;    break;
    };
    switch (channel) {
        case 0:    preTye = 'gdps';    break;
        case 2:    preTye = 'guid';    break;
        case 3:    preTye = 'news';    break;
    };
    let dataForNextButton = `${id},'${preTye}',1`,
        commText = getElement('text').value,
        data =
      'ide='   + encodeURIComponent(id)
    + '&type=' + encodeURIComponent(channel)
    + '&text=' + encodeURIComponent(commText);
    helperRequest(`${sData[1]}comment${sData[6]}`, data)
        .then((data)=>{
            let serverResp = JSON.parse(data);

            innerComments(renderComms(serverResp,typeC,dataForNextButton), 0);
            Loading(1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
deleteComm = (id, channel)=>{
    Loading();
    helperRequest(`${sData[4]}comment${sData[6]}?ide=${id}&type=${channel}`)
        .then((data)=>{
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            getElement('comm'+data).remove();
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},// ###END_REGION

playDoom = ()=>{
    getElement('doom').style.padding = '4vh';
    getElement('doom').innerHTML = `<video autoplay src="./dim.mp4"></video>`; // вау вы нашли пасхалку
},

// ###PAGES_REGION
pHeader = (predrop = '')=>{
    searchMethod = 0;
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let html = 
    `<div class="header" align="left">`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}innerMain(pageMain())">`+
            `<img src="./imgs/home.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}innerMain(pageList())">`+
            `<img src="./imgs/gdpsnew.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}gGuides()">`+
            `<img src="./imgs/guid.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="${predrop}innerMain(helperAbout())">`+
            `<img src="./imgs/about.svg" width=32px>`+
        `</button>`+
        `<button style="width:32px" class="emptybtn" onclick="location.href = 'https://discord.gg/6T84uCgVcz'">`+
            `<img src="./imgs/disc.svg" width=32px>`+
        `</button>`+
        `<nodiv id=switchHtmlLang style=position:relative>`+
            `<button onclick="switchLang()" style="width:32px" class="emptybtn">`+
                `<img data-trans="src" src="./imgs/${mainLang}.png" width=32px style="padding-bottom:6px">`+
            `</button>`+ // !ПОИСК! switchLang = function
        `</nodiv>`+
        `<div style=position:absolute;right:8px;top:24px>`+
            `<nodiv id=switchHtmlLogin style=position:relative>`+
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
pageMain = ()=>{
    setLink('');
    let html = pHeader()+
    `<div class=frameprofile style="margin-top:12vh;padding-top:7vh" id=doom>`+
        `<div class=profileMobile11 align=center style=align-items:center;justify-content:center>`+
            `<img onclick=playDoom() src="./imgs/emptyF.png" width=256px height=256px style="border-radius:48px">`+
            `<h1 style=margin:8px;font-size:48px>GDPS Helper</h1>`+
        `</div>`+
        `<div class=profileMobile2 align=center>`+
            `<img onclick=playDoom() src="./imgs/emptyF.png" width=128px height=128px style="border-radius:24px"><br>`+
            `<h1 style=margin:8px>GDPS Helper</h1>`+
        `</div>`+
        `<div align=center>`+
            `<h1 class=profileMobile1 data-trans="T1-createdForHelp">${getTrans('T1-createdForHelp')}</h1>`+
            `<h2 class=profileMobile2 data-trans="T1-createdForHelp">${getTrans('T1-createdForHelp')}</h2>`+
        `</div>`+
    `</div>`+
    `<div class=frameprofile style="margin-top:40px">`+
        `<div align=center style=display:flex;flex-wrap:wrap;justify-content:center>`+
            `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;height:350px>`+
                `<h2 style=margin-bottom:2px data-trans="T2-promo1">${getTrans('T2-promo1')}</h2>`+
                `<img style=margin:0 src=./imgs/gdpsnew.svg width=192px>`+
                `<p data-trans="T2-promo2" style=font-size:16px;margin:0>${getTrans('T2-promo2')}</p>`+
                `<div style=position:absolute;bottom:8px;left:50%;transform:translate(-50%)>`+
                    `<button class=loginbtn onclick=window.scrollTo(0,0);innerMain(pageList()) data-trans=T2-func1>${getTrans('T2-func1')}</button>`+
                `</div>`+
            `</div>`+
            `<div class=framegdpsOld align=center style=width:330px;text-align:center;position:relative;height:350px>`+
                `<h2 style=margin-bottom:2px data-trans="T2-promo3">${getTrans('T2-promo3')}</h2>`+
                `<img style=margin:0 src=./imgs/plus.svg width=192px>`+
                `<p data-trans="T2-promo4" style=font-size:16px;margin:0>${getTrans('T2-promo4')}</p>`+
                `<div style=position:absolute;bottom:8px;left:50%;transform:translate(-50%)>`+
                    `<button class=loginbtn onclick=window.scrollTo(0,0);${thisUser[1] == 0 ? 'registerPage()' : 'innerMain(profilePage())'} data-trans=register>${getTrans('register')}</button>`+
                `</div>`+
            `</div>`+
        `</div>`+
    `</div>`+
    `<div class=frameprofile style="margin-top:40px">`+
        `<div align=center>`+
            `<h1 data-trans="T1-findAbout">${getTrans('T1-findAbout')}</h1>`+
            `<p data-trans="T1-findHelp">${getTrans('T1-findHelp')}</p>`+
            `<h1 data-trans="T1-insertAbout">${getTrans('T1-insertAbout')}</h1>`+
            `<p data-trans="T1-insertHelp">${getTrans('T1-insertHelp')}</p>`+
        `</div>`+
    `</div>`;
    return html;
},
pageList = ()=>{
    helperFindData = [3,[],[]];
    setLink('list');
    let html = pHeader()+
    `<h1 align=center style=color:white;margin-bottom:10px>GDPS Helper</h1>`+
    `<div id=finder align=left class="frameprofile">`+
        `<h1 data-trans="search">${getTrans('search')}</h1><br>`+
        `<label data-trans="findByName">${getTrans('findByName')}:</label><br>`+
        `<p data-trans="listHelp1">${getTrans('listHelp1')}</p>`+
        `<input data-trans="gdpsName" type=text id=gdpsNameInput class=framelabel style=width:190px placeholder="${getTrans('gdpsName')}"><br><br>`+

        `<label data-trans="tags00">${getTrans('tags00')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick="writeTag('gdps',1)" id=GDtag1 data-trans="GDtag01">${getTrans('GDtag01')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',2)" id=GDtag2 data-trans="GDtag02">${getTrans('GDtag02')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',3)" id=GDtag3 data-trans="GDtag03">${getTrans('GDtag03')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',4)" id=GDtag4 data-trans="GDtag04">${getTrans('GDtag04')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',5)" id=GDtag5 data-trans="GDtag05">${getTrans('GDtag05')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',6)" id=GDtag6 data-trans="GDtag06">${getTrans('GDtag06')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',7)" id=GDtag7 data-trans="GDtag07">${getTrans('GDtag07')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',8)" id=GDtag8 data-trans="GDtag08">${getTrans('GDtag08')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',9)" id=GDtag9 data-trans="GDtag09">${getTrans('GDtag09')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',10)" id=GDtag10 data-trans="GDtag10">${getTrans('GDtag10')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdps',11)" id=GDtag11 data-trans="GDtag11">${getTrans('GDtag11')}</label>`+
        `</div>`+

        `<label data-trans="os00">${getTrans('os00')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label class="tagUns" onclick="writeTag('gdOS',12)" id=GDtag12 data-trans="GDtag12">${getTrans('GDtag12')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',13)" id=GDtag13 data-trans="GDtag13">${getTrans('GDtag13')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',14)" id=GDtag14 data-trans="GDtag14">${getTrans('GDtag14')}</label>`+
            `<label class="tagUns" onclick="writeTag('gdOS',15)" id=GDtag15 data-trans="GDtag15">${getTrans('GDtag15')}</label>`+
        `</div>`+

        `<label data-trans="otherSort">${getTrans('otherSort')}:</label><br>`+
        `<div style=display:flex;flex-wrap:wrap>`+
            `<label data-trans="search1" onclick=setMethod(3) id=method3 class=tagSel>${getTrans('search1')}</label>`+
            `<label data-trans="search4" onclick=setMethod(0) id=method0 class=tagPre>${getTrans('search4')}</label>`+
            `<label data-trans="mostLike" onclick=setMethod(1) id=method1 class=tagPre>${getTrans('mostLike')}</label>`+
            `<label data-trans="mostDisl" onclick=setMethod(2) id=method2 class=tagPre>${getTrans('mostDisl')}</label>`+
            `<label data-trans="search2" onclick=setMethod(4) id=method4 class=tagPre>${getTrans('search2')}</label>`+
            `<label data-trans="search3" onclick=setMethod(5) id=method5 class=tagPre>${getTrans('search3')}</label>`+
        `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
        GDPSrenderMini(CacheGDPSes,'&m=1')+
    `</div>`+
    insertBtn('sendFinder(1,\'method=3\')');
    return html;
},
uvazuha = ()=>{
    setLink('special');
    let html = pHeader()+
    `<div align=center>`+
        `<h1>GDPS Helper</h1>`+
        `<h2 data-trans="special00">${getTrans('special00')}</h2>`+
        `<div class=frameguide align=left>`+
            `<p>DenisC - <span data-trans="special01">${getTrans('special01')}</span></p>`+
            `<a class="loginbtn" href=./archive/ data-trans="special02">${getTrans('special02')}</a>`+

            `<p>Vustur - <span               data-trans="special03">${getTrans('special03')}</span></p>`+
            `<p>MIOBOMB - <span              data-trans="special04">${getTrans('special04')}</span></p>`+
            `<p>lemongd - <span              data-trans="special05">${getTrans('special05')}</span></p>`+
            `<p>??? - <span                  data-trans="special06">${getTrans('special06')}</span></p>`+
            `<p>mirvis - <span               data-trans="special07">${getTrans('special07')}</span></p>`+
            `<p>glorius - <span              data-trans="special09">${getTrans('special09')}</span></p>`+
            `<p>M41den - <span               data-trans="special09">${getTrans('special10')}</span></p>`+
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
                `<img width=128px src="./imgs/mio.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>Vustur</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="./imgs/vus.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>DenisC!!!</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="./imgs/denis.png">`+
            `</div>`+
            `<div style="width:210px;height:200px">`+
                `<p>`+
                    `<span>kot_v_palto</span> - `+
                    `<span data-trans="role02">${getTrans('role02')}</span>`+
                `</p>`+
                `<img width=128px src="./imgs/palto.png">`+
            `</div>`+
        `</div>`+
        `<button data-trans="HLthanks" class="loginbtn" onclick="innerMain(uvazuha())">`+
            getTrans('HLthanks')+
        `</button>`+
    `</div>`;
    return html;
},
gGuides = ()=>{
    setLink('guides');
    let html = pHeader()+
    `<h1 align=center><span data-trans="guides00">${getTrans('guides00')}</span>${thisUser[1] !== 0 ? ' <button class=loginbtn onclick="newGuide()">+</button>' : ''}</h1>`+
    `<div class=gdps-list-place id=guidesPlace>`+
        renderGuideMini(CacheGuides)+
        insertBtn('getGuides(1)')+
    `</div>`;
    innerMain(html);
},
newGuide = (openPlace = '')=>{
    setLink('guideNew');
    let html = pHeader()+
    `<h1 data-trans="guides01" required>${getTrans('guides01')}</h1>`+
    `<button data-trans="otmena" type=button class=loginbtn onclick="${openPlace == 'fromProfile' ? 'innerMain(profilePage(guidesWindow()))' : 'gGuides()'}">${getTrans('otmena')}</button><br>`+
    `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newGuide${sData[6]}')">`+
        `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
        `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
        `<select id="langs" class="framelabel" name="language" required>`+
            `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
            `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
            `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
        `</select><br>`+
        `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
        `<div id=frames>`+
            newGuideFrame()+
        `</div>`+
        `<button data-trans="guides03" type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)">${getTrans('guides03')}</button><br><br>`+
        `<input data-trans="guides04" name=aftertext class=guidInp style=width:210px placeholder="${getTrans('guides04')}"><br>`+
        `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
    `</form>`;
    innerMain(html);
},
newGuideFrame = (id = 0, customContent = null)=>{
    let html =
    `<div class=frameguide id=frame${id} style=position:relative>`+
        `<input data-trans="guides06" name=subtitle[] ${customContent !== null ? `value=${customContent[0]}` : ''} class=guidInp style=width:100%;font-size:24px placeholder="${getTrans('guides06')}"><br>`+
        `${id == 0 ? '' : `<button style="position:absolute;top:20px;right:20px;padding:2px 4px"`+`
         class=loginbtn onclick="removeGuide(${id})" type=button>`+
            `<img style="margin:0" width="24px" src="./imgs/trash.svg">`+
        `</button>`}`+
        `<textarea data-trans="guides07" name=subtext[] class=guidInp style=width:100%;height:240px placeholder="${getTrans('guides07')}">${customContent !== null ? customContent[1] : ''}</textarea>`+
    `</div><br>`;
    if (id !== 0)
        getElement('frames').insertAdjacentHTML('beforeend', html);
    guideEditorFrame++;
    return html;
},
removeGuide = (id)=>{
    if (id == 0)
        return;
    getElement('frame'+id).remove();
},
editGuide = (id)=>{
    let html = pHeader()+
    `<h1 data-trans="guides08" required>${getTrans('guides08')}</h1>`+
    `<button data-trans="otmena" type=button class=loginbtn onclick="innerMain(profilePage(guidesWindow()))">${getTrans('otmena')}</button><br>`+
    `<form id=guidesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editGuide${sData[6]}?id=${id}')">`+
        `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:32px" placeholder="${getTrans('guides02')}"><br>`+
        `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label> `+
        `<select id="langs" class="framelabel" name="language" required>`+
            `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
            `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
            `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
        `</select><br>`+
        `<input data-trans="guides05" name=img class=guidInp id=img placeholder="${getTrans('guides05')}">`+
        `<div id=frames>`+
            // newGuideFrame()+
        `</div>`+
        `<button data-trans="guides03" type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)">${getTrans('guides03')}</button><br><br>`+
        `<input data-trans="guides04" name=aftertext id=aftertext class=guidInp style=width:210px placeholder="${getTrans('guides04')}"><br>`+
        `<button data-trans="commSend" type=submit class=loginbtn>${getTrans('commSend')}</button>`+
    `</form>`;
    innerMain(html);
    Loading();
    helperRequest(`${sData[1]}editGuide${sData[6]}?id=${id}`)
    .then(data => {
        if (data == '["NONE"]') {
            Loading(1);
            innerMain(profilePage(innerProfile(guidesWindow())));
            megaAlert('CONTENTISNULL');
            return;
        }
        setLink('guideEdit='+id);
        Loading(1);
        let parsedData = JSON.parse(data),
            guideinfo = parsedData['guideinfo'],
            guidedata = parsedData['guidedata'];
        getElement('title').value = guideinfo[1];
        getElement('aftertext').value = guideinfo[2];
        document.querySelector(`[value=${guideinfo[3]}]`).setAttribute('selected', '');
        getElement('img').value = guideinfo[4];
        innerGuides(`<input name=guidid value=${id} type=hidden>`);
        guideEditorFrame = 1;
        guidedata.forEach(guid => {
            newGuideFrame(guideEditorFrame, guid);
        });
        document.querySelector('[onclick="removeGuide(1)"]').remove();
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
dropLogin = (type = 0)=>{
    let hcaptchaHtml = getElement('2st');
    if (type === 0) {
        getElement('3st').appendChild(hcaptchaHtml);
        hcaptchaHtml.style.display = 'block';
    } else if (type === 1) {
        getElement('blackEffect').classList.replace('ANIM-create1', 'ANIM-stop1');
        getElement('logonWindow').classList.replace('ANIM-create2', 'ANIM-stop2');
        
        TimeOut[1] = setTimeout(() => {
            getElement('4st').appendChild(hcaptchaHtml);
            hcaptchaHtml.style.display = 'none';
            getElement('blackEffect').remove();
        },300)

    };
},
loginPage = ()=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div id=logonWindow class="upperWindow frameprofile ANIM-create2">`+
            `<h1 data-trans="login">${getTrans('login')}</h1>`+
            `<input style=width:75% data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
            `<input style=width:75%;margin-left:20px data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}">`+
            `<button class=emptybtn onclick=seePassword()>`+
                `<img style=margin:-12px;margin-left:0 id=LGbtn src=./imgs/PShide.svg width=32px>`+
            `</button><br><br>`+
            `<div id=3st style=width:305px;height:82px></div><br><br>`+
            `<button style=width:100% data-trans="remindPass" onclick="dropLogin(1);innerMain(dropWindow())" class="loginbtn">${getTrans('remindPass')}</button><br><br>`+
            `<button style=width:100% data-trans="joinToGdps" onclick="sendLoginForm()" class="loginbtn">${getTrans('joinToGdps')}</button><br>`+
            `<br><button style=width:100% data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
            `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
        `</div>`+
    `</div>`;
    innerMain(html,1);
    dropLogin();
},
registerPage = ()=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div id=logonWindow class="upperWindow frameprofile ANIM-create2">`+
            `<h1 data-trans="register">${getTrans('register')}</h1>`+
            `<input style=width:75% data-trans="login06" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login06')}"><br><br>`+
            `<input style=width:75%;margin-left:20px data-trans="login02" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login02')}">`+
            `<button class=emptybtn onclick=seePassword()>`+
                `<img style=margin:-12px;margin-left:0 id=LGbtn src=./imgs/PShide.svg width=32px>`+
            `</button><br><br>`+
            `<input style=width:75% data-trans="login03" id="LGemail" class="framelabel" required placeholder="${getTrans('login03')}"><br><br>`+
            `<div id=3st style=width:305px;height:82px></div><br><br>`+
            `<button style=width:100% data-trans="register" onclick="sendRegisterForm()" class="loginbtn">${getTrans('register')}</button><br>`+
            `<br><button style=width:100% data-trans="back" class="loginbtn" onclick="dropLogin(1)">${getTrans('back')}</button>`+
            `<p align=right data-trans="helperVer">${getTrans('helperVer')}</p>`+
        `</div>`+
    `</div>`;
    innerMain(html,1);
    dropLogin();
},
contentPreload = (sendCommData = '', backFunc = '')=>{
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="innerMain(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`;
    if (thisUser[3] === 1) html += 
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
GDPSpreload = (sendCommData = '', backFunc = '')=>{
    let html = pHeader()+
    `<div id="insertable" class="gdps-forum"></div>`+
    `<div class="gdps-forum"><canvas id="Stat"></canvas></div>`+
    `<div class="gdps-forum">`+
        `<button data-trans="back" class="loginbtn" onclick="innerMain(${backFunc}">${getTrans('back')}</button>`+
    `</div><br>`+
    `<div style="display:flex; flex-wrap:wrap">`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:60%; flex-basis:400px" align=center id="news"></div>`+
        `<div style="max-height:300px; overflow:auto; margin-bottom:12px; flex:40%">`;
    if (thisUser[3] === 1) html += 
            `<div class="framemain" style="height:60px">`+
                `<p style="margin:0">`+
                    `<span data-trans="loggedAs">${getTrans('loggedAs')}</span>: `+
                    thisUser[0]+
                `</p>`+
                `<input data-trans="min10chars" type="text" class="framelabel" id="text" required minlength=10 placeholder="${getTrans('min10chars')}"><br>`+
                `<button data-trans="commSend" class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn">${getTrans('commSend')}</button>`+
            `</div>`;
    html += 
            `<div id="comments"></div>`+
        `</div>`+
    `</div>`;
    return html;
},
gdpsNewsPage = (gdpsId = 0)=>{
    let html = pHeader()+
    `<div class=gdps-forum>`+
        `<button data-trans="back" class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${getTrans('back')}</button><br>`+
    `</div>`+
    `<div id=GDPSesPlace class=gdps-forum style=flex-direction:column></div>`;
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
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone())">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position:absolute;top:95px;width:235px" align="left">`+
            `<button data-trans="profile" class=loginbtn onclick="innerProfile(gProfileMini())">${getTrans('profile')}</button><br><br>`+
            `<nodiv style=position:relative>`+
                (thisUser[4] == 1 ? '<span style="position:absolute;top:-6px;right:0px;border:solid red 5px;border-radius:8px"></span>' : '')+
                `<button data-trans="Alarms"class=loginbtn onclick="innerProfile(alarmsWindow());GetAlarms()">${getTrans('Alarms')}</button><br><br>`+
            `</nodiv>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())">${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="yourGuides"class=loginbtn onclick="innerProfile(guidesWindow())">${getTrans('yourGuides')}</button><br><br>`+
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
    `<div class=frameprofile style="margin:0;height:100%">`+
        `<button style="position:absolute;top:80px;right:5px" class="profileMobile2 loginbtn" onclick="innerProfile(profileSwitcherPhone(${userId}, '${backButton}'))">`+
            `<div style="transform:rotate(90deg)">|||</div>`+
        `</button>`+
        `<div id="phoneSelector" class=profileMobile1 style="position:absolute;top:95px;width:235px" align="left">`+
            `<button data-trans="profile" class=loginbtn onclick="otherProfileMini(${userId})">${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})">${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="guides00" class=loginbtn onclick="otherGuidesWindow(${userId})">${getTrans('guides00')}</button><br><br>`+
            `<br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`+
        `<div class=profileMobile3 id="profileWindow" align="left">`+
        `</div>`+
    `</div>`;
    innerMain(html);
    innerHtnl(userId);
},// ###END_REGION

// ###OWNER_CONTENT_REGION
getConfInfo = (step = 0)=>{
    if (step == 0) {
        let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
            `<div class="upperWindow frameprofile ANIM-create2" id=F45>`+
                `<form id=formLINK method=post onsubmit="return false">`+
                    `<input data-trans="login02" placeholder=${getTrans('login02')} class=framelabel id=LGpassword><br>`+
                    `<button data-trans="otmena" onclick="getElement('formLINK').setAttribute('onsubmit','return false');closeWindow('F45')" class=loginbtn>${getTrans('otmena')}</button>`+
                    `<button data-trans=commSend onclick=getConfInfo(1);closeWindow('F45') class=loginbtn>${getTrans('commSend')}</button>`+
                `</form>`+
            `</div>`+
        `</div>`;
        innerMain(html,1);
    } else {
        let password = getElement('LGpassword').value;
        getElement('F45').remove();
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
                    innerMain(html2,1);
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
        getElement('btn'+id).remove();
        getElement('fullAlarm').remove();
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
MCedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}modc${sData[6]}?id=${gdpsId}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            getElement('MC'+gdpsId).innerHTML = getTrans(data);
        });
},
CCedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}crec${sData[6]}?id=${gdpsId}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            getElement('CC'+gdpsId).innerHTML = getTrans(data);
        });
},
JEedit = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}setj${sData[6]}?id=${gdpsId}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            getElement('JE'+gdpsId).innerHTML = getTrans(data);
        });
},
ballsUp = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[1]}bump${sData[6]}?id=${gdpsId}`)
        .then(data => {
            Loading(1);
            if (data == 'no') 
                return getElement('BL'+gdpsId).innerHTML = getTrans('gdpsunckecked');
            let pData = JSON.parse(data),
                canBump;
            if (pData[2] > 0) {
                canBump = `<span data-trans=isBL>${getTrans('isBL')}</span>`;
            } else {
                canBump = `<span data-trans=wait1>${getTrans('wait1')}</span>${Math.abs(pData[2])}<span data-trans=wait2>${getTrans('wait2')}</wait>`;
                if (pData[2] == -7200) {
                    megaAlert('bumped');
                    myGdpses[0]['g'+gdpsId][14] = pData[0];
                }
            }
            getElement('BL'+gdpsId).innerHTML = canBump;
        });
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
            let parsedData = JSON.parse(data),
                html = 
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
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
ownersAdd = (id, contentType)=>{
    let userData = getElement('addown').value;
    Loading();
    helperRequest(`${sData[1]}permAdd${sData[6]}?gdps=${id}&type=${contentType}&user=${userData}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            let parsedData = JSON.parse(data),
                html =
                `<tr id=perm${parsedData[1]}>`+
                    `<td>`+
                    parsedData[0]+
                    `</td>`+
                    `<td>`+
                        `<button data-trans="delete" class=loginbtn onclick="deleteOwner(${id},${contentType},${parsedData[1]})">${getTrans('delete')}</button>`+
                    `</td>`+
                `</tr>`;
            innerComments(html, 1);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
deleteOwner = (contentId, contentType, userId)=>{
    Loading();
    helperRequest(`${sData[1]}perm${sData[6]}?gdps=${contentId}&type=${contentType}&id=${userId}`)
        .then(data => {
            Loading(1);
            if (data == '-2')
                return returnError('Access denied');
            getElement('perm'+userId).remove();
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
getJoinLog = (gdpsId)=>{
    Loading();
    helperRequest(`${sData[0]}getJoinLog${sData[6]}?id=${gdpsId}`)
        .then(data => {
            Loading(1);
            setLink('gdpsLog='+gdpsId);
            let parsedData = JSON.parse(data),
                html = 
            `<div>`+
                `<h1><span data-trans="joinsTo">${getTrans('joinsTo')}</span> ${parsedData[0][0]}</h1>`+
                `<table>`;
            parsedData.forEach(arrat => {
                if (arrat[1] !== 'Microwave') {
                    html +=
                    `<tr>`+
                        `<td>`+
                            arrat[0]+
                        `</td>`+
                        `<td>`+
                            timeAgo(arrat[1])+
                        `</td>`+
                        `<td>`+
                            arrat[2]+
                        `</td>`+
                    `</tr>`;
                }
            });
            html += 
                `</table>`+
            `</div>`;
            innerProfile(html);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
editLink = (gdpsId)=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div class="upperWindow frameprofile ANIM-create2" id=link${gdpsId}>`+
            `<h2 data-trans="addGdps03a">${getTrans('addGdps03a')}</h2>`+
            `<form id=formLINK onsubmit="return enterFormData(this,'refreshGdps${sData[6]}')">`+
                `<input name=gdps value="${gdpsId}" type=hidden>`+
                `<input data-trans="addGdps03b" placeholder="${getTrans('addGdps03b')}" class=framelabel name=link><br>`+
                `<button data-trans="otmena" onclick="getElement('formLINK').setAttribute('onsubmit','return false');closeWindow('link${gdpsId}')" class=loginbtn>${getTrans('otmena')}</button>`+
                `<input data-trans="commSend" type=submit value=${getTrans('commSend')} class=loginbtn>`+
            `</form>`+
            `<span style=opacity:50% data-trans=didntBan>${getTrans('didntBan')}</span>`+
        `</div>`+
    `</div>`;
    innerMain(html,1);
},// ###END_REGION

// ###PUBLIC_RENDER_REGION
toStringGDPS = (tag)=>{
    switch (tag) {
        case "1": return 'GDtag01';
        case "2": return 'GDtag02';
        case "3": return 'GDtag03';
        case "4": return 'GDtag04';
        case "5": return 'GDtag05';
        case "6": return 'GDtag06';
        case "7": return 'GDtag07';
        case "8": return 'GDtag08';
        case "9": return 'GDtag09';
        case "10": return 'GDtag10';
        case "11": return 'GDtag11';
        case "12": return 'GDtag12';
        case "13": return 'GDtag13';
        case "14": return 'GDtag14';
        case "15": return 'GDtag15';
    };
},
GDPSrenderMini = (parsedData, joinData = '')=>{
    let html = '',
        Count =    0,

        gdpsData = null,
        id = null,
        gdpsTitle = null,
        description = null,
        Tags = null,
        os = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        isWeekly = null,
        gdpsLang = null,
        isWeeklyData = ['',''],
        tagsOs = '';
    
    for (let Id in parsedData) {
        Count++;
        if (Count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        gdpsTitle = gdpsData[1];
        description = gdpsData[2];
        Tags = JSON.parse(gdpsData[3]);
        os = JSON.parse(gdpsData[4]);
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        isWeekly = gdpsData[10];
        gdpsLang = gdpsData[13];
        tagsOs =   '';

        renderJoinLink = renderJoinLink ? '' : `<a class="loginbtnGDPS" data-trans="joinToGdps" href="join${sData[6]}?id=${id}${joinData}" target=_blank>${getTrans('joinToGdps')}</a>`;

        if(isWeekly == 1)
            isWeeklyData = `<h1 data-trans="weekGdps" style="position:absolute;top:-55px;background:var(--color-light);border-radius:8px;width:calc(100% - 16px);" align="center">${getTrans('weekGdps')}</h1>`;
        else 
            isWeeklyData = '';
        
        Tags.forEach((tag)=>{
            tagsOs += `<div class="tag" data-trans="${toStringGDPS(tag)}">${getTrans(toStringGDPS(tag))}</div>`;
        });
        os.forEach((tag)=>{
            tagsOs += `<div class="tag" data-trans="${toStringGDPS(tag)}">${getTrans(toStringGDPS(tag))}</div>`;
        });
        
    
        html += 
        `<div class="framegdps" style="width:300px;height:450px" id="g${id}">`+
            isWeeklyData+
            `<div class=loh style="min-height:128px">`+
                `<h2 style=width:290px>${gdpsTitle} <img src="./imgs/${gdpsLang}.png"></h2>`+
                `<p style="margin:0">`+
                    `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                    `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
                `</p>`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
            `</div>`+

            `<img class=FGDPStext id="guideimg" style=width:316px;height:148px width=296px src="./imgs/empty.jpg" onerror="this.src='./imgs/empty.jpg'">`+
            `<div class="FGDPSdemo gdpsalpha" style="width:316px;height:75px"></div>`+

            `<div style=position:absolute;bottom:0;width:100%>`+
                `<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
                    `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                    `<button onclick="sendLike(${id},0)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},0)" id="dislike"></button>`+
                `</div>`+
                `<div class="likezone" style=position:absolute;bottom:0;right:16px>`+
                    `${renderJoinLink}`+
                    `<button data-trans="moreInfo" class=loginbtnGDPS style=margin-left:-2px;border-bottom-right-radius:16px onclick="helperContent('gdps', ${id}${joinData ? `,'${joinData}'` : ''})">${getTrans('moreInfo')}</button>`+
                `</div>`+
            `</div>`+
            `<p class="FGDPStext absolute" style="margin:0">${description}${description[120] === undefined ? '' : '...'}</p>`+
            `<div class="flex-row FGDPStags absolute">${tagsOs}</div>`+
        `</div>`;
    };
    return html;
},
gdpsReport = (gdpsId)=>{
    let html = `<div id=blackEffect class="megaWindow ANIM-create1">`+
        `<div class="upperWindow frameprofile ANIM-create2" id=REPform>`+
            `<h1 data-trans="report01">${getTrans('report01')}</h1>`+
            `<form id=formREP onsubmit="return enterFormData(this,'report${sData[6]}')">`+
                `<input name=gdps value="${gdpsId}" type=hidden>`+
                `<textarea data-trans="report02" style="width:250px;height:100px" placeholder="${getTrans('report02')}" class=framelabel name=text></textarea><br>`+
                `<button data-trans="otmena" onclick="getElement('formREP').setAttribute('onsubmit','return false');closeWindow('REPform')" class=loginbtn>${getTrans('otmena')}</button>`+
                `<input data-trans="commSend" type=submit value=${getTrans('commSend')} class=loginbtn>`+
            `</form>`+
        `</div>`+
    `</div>`;
    innerMain(html,1);
},
closeWindow = (windowId)=>{
    getElement('blackEffect').classList.replace('ANIM-create1', 'ANIM-stop1');
    if (getElement(windowId))
        getElement(windowId).classList.replace('ANIM-create2', 'ANIM-stop2');
    
    TimeOut[1] = setTimeout(() => {
        getElement('blackEffect').remove();
    },300)
},
GDPSrender = (parsedData, joinData = '')=>{
    let html = '',

        gdpsData = parsedData.gdps,
        id = gdpsData[0],
        gdpsTitle = gdpsData[1],
        description = gdpsData[2],
        Tags = JSON.parse(gdpsData[3]),
        os = JSON.parse(gdpsData[4]),
        likesCount = gdpsData[5],
        userId = gdpsData[6],
        username = gdpsData[7],
        pictureLink = gdpsData[8],
        renderJoinLink = gdpsData[9],
        serverStatus = gdpsData[10],
        tagsOs =   '';

    Tags.forEach((tag)=>{
        tagsOs += `<div class="tag" data-trans="${toStringGDPS(tag)}">${getTrans(toStringGDPS(tag))}</div>`;
    });
    html += '</div>'+'<div class="flex-row">';
    os.forEach((tag)=>{
        tagsOs += `<div class="tag" data-trans="${toStringGDPS(tag)}">${getTrans(toStringGDPS(tag))}</div>`;
    });

    switch (serverStatus) {
        case -1:
            serverStatus = getTrans('GDPSstatus10');
            break;
        case 0:
            serverStatus = getTrans('GDPSstatus00');
            break;
        case 1:
            serverStatus = getTrans('GDPSstatus01');
            break;
    };

    html += 
    `<div class="framegdps">`+
        `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=128px height=128px style="border-radius:24px">`+
        `<h2>${gdpsTitle}</h2>`+
        `<h3>${serverStatus}</h3>`+
        `<p style="margin:0">`+
            `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
            `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
        `</p>`+
        `<div class="flex-row">${tagsOs}</div>`+
        `<p>${Markdown(description)}</p>`+
        `<div style="margin-top:15px">`+
            `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}${joinData}" target=_blank>${getTrans('joinToGdps')}</a>`+
            `<button data-trans="getLink" class="loginbtn" onclick="linkCopy('https://gdpshelper.xyz/list/gdps${sData[6]}?id=${id}')">${getTrans('getLink')}</button>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                `<button onclick="sendLike(${id},0)" id="like"></button>`+
                `<button onclick="sendDislike(${id},0)" id="dislike"></button>`+
            `</div>`+
        `</div>`+
        `<button onclick="gdpsReport(${id})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img src=./imgs/flag.svg width=16px style=margin:0>`+
        `</button>`+
    `</div>`;
    return html;
},
renderGuideMini = (guides, guidesPage = 1)=>{
    let html = '',
        Count = 0,
        id,
        guidTitle,
        guidLang,
        date,
        guidImg,
        likes;

    guides.forEach(guid => {
        Count++;
        if (Count == 5) {
            innerGuides(insertBtn(`getGuides(${guidesPage})`), 1);
            return html;
        }

        id = guid[0];
        guidTitle = guid[1];
        guidLang = guid[2];
        date = guid[3];
        likes = guid[4];
        guidImg = guid[5];
        html += `<div class="framegdpsOld" style="width:250px;height:200px">`+
        `<img id="guideimg" width=266px src="${guidImg}" onerror="this.src='./imgs/empty.jpg'">`+
        `<div class="guidepic"></div>`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="./imgs/${guidLang}.png"></h2>`+
            `<div style="position:absolute;bottom:0;width:100%">`+
                `<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
                    `<span class=likeplace id="likesCount${id}">${likes}</span>`+
                    `<button onclick="sendLike(${id},7)" id="like"></button>`+
                    `<button onclick="sendDislike(${id},7)" id="dislike"></button>`+
                `</div>`+
                `<div class="likezone" style=position:absolute;bottom:0;right:16px>`+
                    `<button data-trans="moreInfo" style=margin-left:-2px;border-bottom-right-radius:16px class=loginbtnGDPS onclick="GetGuide(${id})">${getTrans('moreInfo')}</button>`+
                `</div>`+
            `</div>`+
        `</div>`;
    });
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
        commText = null,
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
        commText = gdpsData[2];
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
            `<img width=24px src="./imgs/trash.svg">`+
        `</button>`;
        
        html = 
        `<div class="framecomm" id=comm${id}>`+
            `<button style="border:none;background:none;margin:0;font-size:32px;font-weight:bold;color:${nameColor}"`+
            `onclick="otherProfile(${userId},lastUsed3)">${username}</button>`+
            `<p style="margin:0">${timeAgo(date)}</p>`+
            `<p>${commText}</p>`+
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
RenderNews = (data, isComm = 0, innerGdpsRendered = 'mega')=>{
    let html = '',
        html2 = '',
        delBtn = '',
        canDel = false,
        
        gdpsData = null,
        id = null,
        newsTitle = null,
        newsText = null,
        userId = null,
        username = null,
        gdpsId = null,
        gdpsTitle = null,
        date = null,
        likesCount = null,
        miniRenderMode =   '';

    let myGdpsesIds = [];

    for (let gdpsKey in myGdpses[0]) {
        if (thisUser[1] == myGdpses[0][gdpsKey][6])
            myGdpsesIds.push(myGdpses[0][gdpsKey][0]);
    };

    if (innerGdpsRendered == 'mini')
        miniRenderMode = 'style="width:calc(100% - 40px)"';


    for (let ide in data)  {
    
        html = '';
        
        gdpsData = data[ide];
        id = gdpsData[0];
        newsTitle = gdpsData[1];
        newsText = gdpsData[2];
        userId = gdpsData[3];
        username = gdpsData[4];
        gdpsId = gdpsData[5];
        gdpsTitle = gdpsData[6];
        date = gdpsData[7];
        likesCount = gdpsData[8];

        delBtn = 
        `<button onclick="deleteNews(${id},${isComm})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
            `<img style=margin:0 width=24px src="./imgs/trash.svg">`+
        `</button>`;
        canDel = false;
        if (thisUser[1] == userId || myGdpsesIds.includes(gdpsId))
            canDel = true;
    
        html = 
        `<div class=framegdpsOld id=news${id} ${miniRenderMode}>`+
            `<h1>${newsTitle}</h1>`+
            `<button class=loginbtn onclick="helperContent('gdps', ${gdpsId})">${gdpsTitle}</button>`+
            `- <button class=emptybtn onclick="otherProfile(${userId},'helperNews(${gdpsId})')">${username}</button>`+
            `<p>${timeAgo(date)}</p>`+
            `<p>${Markdown(newsText)}</p>`+
            `<div class="likezone">`+
                `<span class=likeplace id="likesCount${id}">${likesCount}</span>`+
                `<button onclick="sendLike(${id},2)" id="like"></button>`+
                `<button onclick="sendDislike(${id},2)" id="dislike"></button>`+
            `</div>`+
            (canDel || thisUser[2] > 0 ? delBtn : '')+
            `${isComm ? '' : `<button data-trans="comms" class=loginbtn onclick=helperContent('newsC',${id},${gdpsId})>${getTrans('comms')}</button>`}`+
        `</div>`;
        html2 = html2 + html;
    };
    if (html2 == '')
        return `<h1 data-trans="newsNoneReal">${getTrans('newsNoneReal')}</h1>`;
    return html2;
},
renderStat = (data)=>{
    if (JSON.stringify(data) === '[]') {return getElement('Stat').remove()}

    var parsedData = data;
    var dates = [];
    var levels = [];

    for (var i = 0; i < parsedData.length; i++) {
        dates.push(parsedData[i].date);
        levels.push(parsedData[i].levels);
    }

    var canvas = getElement('Stat');
    var ctx = canvas.getContext('2d');

    var chartWidth = canvas.width - 40;
    var chartHeight = canvas.height - 80;

    var maxValue = Math.max.apply(null, levels);
    var barWidth = chartWidth / levels.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var dated = null;

    var date = null;

    var barHeight = null;
    var x = null;
    var y = null;

    for (var i = 0; i < levels.length; i++) {
        dated = new Date(dates[i] * 1000);
    
        date = dated.getFullYear() + ':' + dated.getMonth() + ':' + dated.getDate();
    
        barHeight = (levels[i] / maxValue) * chartHeight;
        x = i * barWidth + 20;
        y = chartHeight - barHeight + 20;
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        ctx.fillStyle = '#fff';
        ctx.fillText(levels[i], x, y - 10);
    
        ctx.save();
        ctx.translate(x, canvas.height - 10);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillStyle = '#fff';
        ctx.fillText(date, 0, 0);
        ctx.restore();
    };
},
timeAgo = (timestamp)=>{
    let timeDiff = Math.floor((Date.now() / 1000) - timestamp);

    if (timeDiff < 60) {
        return timeDiff + getTrans('timeAgo01');
    } else if (timeDiff < 3600) {
        let Minutes = Math.floor(timeDiff / 60),
            Seconds = timeDiff % 60;
        return Minutes + getTrans('timeAgo02') + Seconds + getTrans('timeAgo03');
    } else if (timeDiff < 86400) {
        let Hours = Math.floor(timeDiff / 3600),
            Minutes = Math.floor((timeDiff % 3600) / 60);
        return Hours + getTrans('timeAgo04') + Minutes + getTrans('timeAgo05');
    } else if (timeDiff < 604800) {
        let Days = Math.floor(timeDiff / 86400),
            Hours = Math.floor((timeDiff % 86400) / 3600);
        return Days + getTrans('timeAgo06') + Hours + getTrans('timeAgo07');
    } else if (timeDiff < 2592000) {
        let Weeks = Math.floor(timeDiff / 604800),
            Days = Math.floor((timeDiff % 604800) / 86400);
        return Weeks + getTrans('timeAgo08') + Days + getTrans('timeAgo09');
    } else if (timeDiff < 31536000) {
        let Months = Math.floor(timeDiff / 2592000),
            Weeks = Math.floor((timeDiff % 2592000) / 604800);
        return Months + getTrans('timeAgo10') + Weeks + getTrans('timeAgo11');
    } else {
        return getTrans('timeAgo12');
    };
},// ###END_REGION

// ###OTHER_REGION
seePassword = ()=>{
    if (getElement('LGpassword').type == 'password') {
        getElement('LGpassword').type = 'text';
        getElement('LGbtn').src = './imgs/PSsee.svg';
    } else {
        getElement('LGpassword').type = 'password';
        getElement('LGbtn').src = './imgs/PShide.svg';
    }
},

Markdown = (mdText)=>{
    // first, handle syntax for code-block
    mdText = mdText.replace(/\r\n/g, '\n');
    mdText = mdText.replace(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>' );
    mdText = mdText.replace(/\n``\` *(.*?)\n([\s\S]*?)\n``\`/g, '<pre><code title="$1">$2</code></pre>' );
  
    // split by "pre>", skip for code-block and process normal text
    var mdHTML = '';
    var mdCode = mdText.split( 'pre>');
  
    for (var i=0; i<mdCode.length; i++) {
        if ( mdCode[i].substr(-2) == '</' ) {
            mdHTML += '<pre>' + mdCode[i] + 'pre>';
        } else {
            mdHTML += mdCode[i].replace(/(.*)<$/, '$1')
            .replace(/^##### (.*?)\s*#*$/gm, '<h5>$1</h5>')
            .replace(/^#### (.*?)\s*#*$/gm, '<h4 id="$1">$1</h4>')
            .replace(/^### (.*?)\s*#*$/gm, '<h3 id="$1">$1</h3>')
            .replace(/^## (.*?)\s*#*$/gm, '<h2 id="$1">$1</h2>')
            .replace(/^# (.*?)\s*#*$/gm, '<h1 id="$1">$1</h1>')    
            .replace(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')    
            .replace(/``(.*?)``/gm, '<code>$1</code>' )
            .replace(/`(.*?)`/gm, '<code>$1</code>' )
            .replace(/^\>> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
            .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
            .replace(/<\/blockquote\>\n<blockquote\>/g, '\n<br>' )
            .replace(/<\/blockquote\>\n<br\><blockquote\>/g, '\n<br>' )
            .replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img alt="$1" src="$2" $3 />')
            .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" />')
            .replace(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')
            .replace(/<http(.*?)\>/gm, '<a href="http$1">http$1</a>')
            .replace(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
            .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
            .replace(/^[\*|+|-][ |.](.*)/gm, '<ul><li>$1</li></ul>' ).replace(/<\/ul\>\n<ul\>/g, '\n' )
            .replace(/^\d[ |.](.*)/gm, '<ol><li>$1</li></ol>' ).replace(/<\/ol\>\n<ol\>/g, '\n' )
            .replace(/\*\*\*(.*)\*\*\*/gm, '<b><em>$1</em></b>')
            .replace(/\*\*(.*)\*\*/gm, '<b>$1</b>')
            .replace(/\*([\w \d]*)\*/gm, '<em>$1</em>')
            .replace(/___(.*)___/gm, '<b><em>$1</em></b>')
            .replace(/__(.*)__/gm, '<u>$1</u>')
            .replace(/_([\w \d]*)_/gm, '<em>$1</em>')
            .replace(/~~(.*)~~/gm, '<del>$1</del>')
            .replace(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')
            .replace(/ +\n/g, '\n<br/>')
            .replace(/\n\s*\n/g, '\n<p>\n')
            .replace(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>')
            .replace(/^\t(.*)/gm, '<pre><code>$1</code></pre>' )
            .replace(/<\/code\><\/pre\>\n<pre\><code\>/g, '\n' )
            .replace(/\\([`_\\\*\+\-\.\(\)\[\]\{\}])/gm, '$1' );
        }  
    }
    mdHTML = mdHTML.replaceAll("\n", '<br>');
    return mdHTML.trim();
},

profileSwitcherPhone = (userId = thisUser[1], backButton = '')=>{
    let html = '';
    if (userId === thisUser[1]) {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile" class=loginbtn onclick="innerProfile(gProfileMini())">${getTrans('profile')}</button><br><br>`+
            `<button data-trans="Alarms" class=loginbtn onclick="innerProfile(alarmsWindow());GetAlarms()">${getTrans('Alarms')}</button><br><br>`+
            `<button data-trans="yourGdpses"class=loginbtn onclick="innerProfile(gdpsesWindow())">${getTrans('yourGdpses')}</button><br><br>`+
            `<button data-trans="YourGuides"class=loginbtn onclick="innerProfile(guidesWindow())">${getTrans('yourGuides')}</button><br><br>`+
        `</div>`;
    } else {
        html = `<div id="phoneSelector" class=profileMobile2>`+
            `<button data-trans="profile" class=loginbtn onclick="otherProfileMini(${userId})">${getTrans('profile')}</button><br><br>`+
            `<button data-trans="notYourGdpses" class=loginbtn onclick="otherGdpsesWindow(${userId})">${getTrans('notYourGdpses')}</button><br><br>`+
            `<button data-trans="guides00" class=loginbtn onclick="otherGuidesWindow(${userId})">${getTrans('guides00')}</button><br><br>`+
            `<br><button data-trans="back" class=loginbtn onclick="${backButton}">${getTrans('back')}</button>`+
        `</div>`;
    };
    return html;
},

switchLangMenu = ()=>{
    let preLang = '';
    for (let lang in translateData) {
        preLang += 
        `<button onclick="switchLang('${lang}')" style="width:32px" class="emptybtn">`+
            `<img src="./imgs/${lang}.png" width=32px style="padding-bottom:6px">`+
        `</button>`;
    };
    return `<div id=switchHtmlLang2 style="position:absolute;top:-16px;left:40px;padding:8px;border:solid black 3px;border-radius:8px;background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLang = (lang = 32)=>{
    if (lang === 32) {
        if (!getElement('switchHtmlLang2')) {
            getElement('switchHtmlLang').insertAdjacentHTML('beforeend', switchLangMenu());
        } else {
            getElement('switchHtmlLang2').remove();
        }
    } else {
        translateReplaceLang(lang);
        getElement('switchHtmlLang2').remove()
    }
},

switchLoginMenu = (predrop)=>{
    if (thisUser[1] === 0) {
        loginPage();
        return '';
    }
    if (predrop === 'predrop')
        predrop = 'dropLogin(1);';
    let preLang = '';
    preLang +=
    `<button style="width:80px" class="emptybtn" onclick="${predrop}innerMain(profilePage())">`+
        `<span data-trans="profile">${getTrans('profile')}</span>`+
    `</button>`+
    `<button style="width:80px" class="emptybtn" onclick="${predrop}gLogout()">`+
        `<span data-trans="logout">${getTrans('logout')}</span>`+
    `</button>`;
    return `<div id=switchHtmlLogin2 style="position:absolute; bottom:-55px; right:0px; padding:8px; border:solid black 3px;border-radius:8px; background-color:rgba(255,255,255,.1);">`+
        preLang+
    `</div>`;
},
switchLogin = (lang = 32, predrop)=>{
    if (lang === 32) {
        if (!getElement('switchHtmlLogin2')) {
            getElement('switchHtmlLogin').insertAdjacentHTML('beforeend', switchLoginMenu(predrop))
        } else {
            getElement('switchHtmlLogin2').remove()
        }
    } else {
        getElement('switchHtmlLogin2').remove()
    }
},

Loading = (stop = 0)=>{
    if (stop == 0)
        document.body.insertAdjacentHTML('beforeend',
            '<div data-trans="loading..." class=ALERT id=TheLoadElem style=position:absolute><h1>' +
                getTrans('loading...') +
            '</h1></div>'
        );
    else 
        if (getElement('TheLoadElem'))
            getElement('TheLoadElem').remove();
},
linkCopy = (string)=>{
    navigator.clipboard.writeText(string)
        .then(()=>{})
        .catch((error)=>{console.error(error);returnError(error)});
    megaAlert('copied');
},
megaAlert = (text, waitTime = 3000)=>{
    innerMain(`<div class=ALERT id=alert><h1 data-trans="${text}">${getTrans(text)}</h1></div>`,1);
    setTimeout(()=>{
        getElement('alert').remove();
    }, waitTime);
},

enterFormData = (form, sendPlace)=>{
    let FORMDATA = new FormData(form),
    params = new URLSearchParams(FORMDATA).toString();

    Loading();
    helperRequest(`${sData[1]}${sendPlace}`, params)
    .then(data => {
        Loading(1);
        if (sendPlace.indexOf('?') !== -1)
            sendPlace = sendPlace.split('?')[0];
        switch (sendPlace) {
            case 'newsPost'+sData[6]:
                helperContent('gdps',FORMDATA.get('gdps'));
                break;
            case 'writeAlarm'+sData[6]:
                getElement('F45').remove();
                break;
            case 'report'+sData[6]:
                megaAlert('reported', 1000);
                closeWindow('REPform');
                break;
            case 'newGuide'+sData[6]:
                GetGuide(data);
                break;
            case 'editGuide'+sData[6]:
                GetGuide(data);
                break;
            case 'refreshGdps'+sData[6]:
                closeWindow('link'+FORMDATA.get('gdps'));
                if (data === FORMDATA.get('link')) 
                    megaAlert('reported');
                else 
                    megaAlert('otmena');
                break;
            default:
                let serverResp = JSON.parse(data);
                CacheGDPSes = serverResp[1];
                CacheGuides = serverResp[2];
                thisUser = serverResp[0];
                myGdpses = [];
                myguides = [];
                myGdpses.push(serverResp[3][0]);
                myguides.push(serverResp[3][1]);
                innerMain(profilePage());
        };
        return false;
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});

    return false;
},
deleteNews = (id, goBack)=>{
    Loading();
    helperRequest(`${sData[4]}newsPost${sData[6]}?ide=${id}`)
        .then((data)=>{
            Loading(1);
            if (data == '-1')
                return returnError('Access denied');
            getElement('news'+data).remove();
            goBack ? history.back() : null;
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},// ###END_REGION

// ###PROFILE_PAGES_REGION
gProfileMini = ()=>{
    setLink('profile');
    let accStatus = thisUser[3] ? getTrans('isActive') : getTrans('isNotact'),
        html = 
    `<h1 data-trans="yourProf">${getTrans('yourProf')}</h1>`+
    `<p><span data-trans="profName">${getTrans('profName')}</span>: <span id=oldNick>${thisUser[0]}</span></p>`+
    `<button data-trans="edit" onclick="editNickPre()" class=loginbtn>${getTrans('edit')}</button>`+
    `<div style=position:relative id=newNick></div>`+
    `<p><span data-trans="profId">${ getTrans('profId') }</span>: ${thisUser[1]}</p>`+
    `<p><span data-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(thisUser[2])}</p>`+
    `<p><span data-trans="profAccs">${getTrans('profAccs')}</span> <span data-trans="${thisUser[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`+
    `<button data-trans="logout2" class=loginbtn onclick=gLogout()>${getTrans('logout2')}</button><br><br>`+
    `<button data-trans="getLogin" class=loginbtn onclick=getConfInfo()>${getTrans('getLogin')}</button><br><br>`+
    `<button data-trans="dropPass" class=loginbtn onclick="innerMain(dropWindow())">${getTrans('dropPass')}</button>`;
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
gdpsesWindow = ()=>{
    setLink('addedGdpses');
    let gdpses = "";
    myGdpses.forEach((gdps) => {
        gdpses+=GDPSrenderInProfileFull(gdps);
    });
    let html =
    `<h1 data-trans="yourGdpses">${getTrans('yourGdpses')}</h1><br>`+
    `<div align=left>`+
    `<button data-trans="addGdps" onclick="innerProfile(addGdps())" style=font-size:24px class=loginbtn>${getTrans('addGdps')}</button>`+
    `<button data-trans="addNews" onclick="innerProfile(newsWindow())" style=font-size:24px;margin-top:4px class=loginbtn>${getTrans('addNews')}</button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 380px); overflow:auto' align=left>`+
        gdpses+
    `</div>`;
    return html;
},
newsWindow = ()=>{
    let gdpses = '';
    for (let gdpsKey in myGdpses[0]) {
        let Gdps = myGdpses[0][gdpsKey],
            Gid = Gdps[0],
            newsTitle = Gdps[1];

        gdpses += `<option value=${Gid}>${newsTitle}</option>`
    };
    let html = 
    `<h1 data-trans="newPost" id=blacktext>${getTrans('newPost')}</h1>`+
    `<form method=post onsubmit="return enterFormData(this,'newsPost${sData[6]}')">`+
        `<input data-trans="addGdps01" class=framelabel type=title placeholder=${getTrans("addGdps01")} name=title><br>`+
        `<textarea data-trans="newsText" class=framelabel name=text placeholder="${getTrans('newsText')}"></textarea><br>`+
        `<select class=framelabel name=gdps>${gdpses}</select><br>`+
        `<input data-trans="publishNews" type=submit value="${getTrans('publishNews')}" class="loginbtn">`+
    `</form>`;
    return html;
},
guidesWindow = ()=>{
    setLink('addedGuides');
    let guides = "";
    myguides.forEach(guid => {
        guides+=GUIDrenderInProfileFull(guid);
    });
    let html =
    `<h1 data-trans="yourGuides">${getTrans('yourGuides')}</h1><button class=loginbtn onclick="newGuide('fromProfile')">+</button><br><br>`+
    `<div style='display:flex;align-items:center;flex-wrap:wrap;flex-direction:row' align=left>`+
        guides+
    `</div>`;
    return html;
},
GDPSrenderInProfileFull = (parsedData)=>{
    let html = '',
        Count = 0,

        gdpsData = null,
        id = null,
        gdpsTitle = null,
        description = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        CC = null,
        MC = null,
        PointsPre = null,
        Points = null;
    
    for (let Id in parsedData) {
        Count++;
        if (Count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        gdpsTitle = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        CC = gdpsData[11];
        MC = gdpsData[12];
        if (gdpsData[15] == '0') {
            Points = `<span data-trans=gdpsunckecked>${getTrans('gdpsunckecked')}</span>`;
        } else if (gdpsData[15] == '-1') {
            Points = `<span data-trans=gdpsbanned>${getTrans('gdpsbanned')}</span>`;
        } else {
            PointsPre = ~~(Date.now() / 1000) - gdpsData[14];
            Points = PointsPre > 0 ? `<span data-trans=isBL>${getTrans('isBL')}</span>` : `<span data-trans=wait1>${getTrans('wait1')}</span>${Math.abs(PointsPre)}<span data-trans=wait2>${getTrans('wait2')}</wait>`;
        }
        renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`;

        let coownersBtn = '';

        if (thisUser[1] == userId)
            coownersBtn = `<button data-trans="coowners" onclick="coownersMenu(${id},3)" class=loginbtn style="margin-top:8px">${getTrans('coowners')}</button>`;
        else 
            coownersBtn = `<button data-trans="coownersNone" class=loginbtn style="margin-top:8px">${getTrans('coownersNone')}</button>`;

        html += 
        `<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${id}">`+
            `<h2 style="display:inline;margin-right:4px">${gdpsTitle}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
            (gdpsData[15] == 1 ? `<button data-trans="editLink" onclick="editLink(${id})" class=loginbtn style="margin-top:8px">${getTrans('editLink')}</button>` : '')+
            `<button data-trans="editGdps" onclick="editGdps(${id})" class=loginbtn style="margin-top:8px">${getTrans('editGdps')}</button>`+
            coownersBtn+
            `<button data-trans="demons" onclick="window.open('./demon/?g=${id}#lists', '_blank').focus()" class=loginbtn style="margin-top:8px">${getTrans('demons')}</button>`+
            `<button data-trans="joins" onclick="getJoinLog(${id})" class=loginbtn style="margin-top:8px">${getTrans('joins')}</button><br><br>`+
            `<span data-trans="isMC">${getTrans('isMC')}</span>:<button id=MC${id} class="loginbtn" data-trans="${!!MC ? 'CCtrue' : 'CCfalse'}" onclick="MCedit(${id})">${getTrans(!!MC ? 'CCtrue' : 'CCfalse')}</button><br>`+
            `<span data-trans="isCC">${getTrans('isCC')}</span>:<button id=CC${id} class="loginbtn" data-trans="${!!CC ? 'CCtrue' : 'CCfalse'}" onclick="CCedit(${id})">${getTrans(!!CC ? 'CCtrue' : 'CCfalse')}</button><br>`+
            `<span data-trans="isJE">${getTrans('isJE')}</span>:<button id=JE${id} class="loginbtn" data-trans="${!!renderJoinLink ? 'no' : 'yes'}" onclick="JEedit(${id})">${getTrans(!!renderJoinLink ? 'no' : 'yes')}</button><br>`+
            `<span data-trans="isBL">${getTrans('isBL')}</span>:<button id=BL${id} class="loginbtn" ${gdpsData[15] == 1 ? `onclick="ballsUp(${id})"` : ''}>${Points}</button>`+
        `</div>`;
    };
    return html;
},
GUIDrenderInProfileFull = (parsedData)=>{
    let html = '',
        Count = 0,
        
        gdpsData = null,
        id = null,
        guidTitle = null,
        guidLang = null,
        date = null,
        likes = null,
        guidImg = null,
        userId = null;

    for (let Id in parsedData) {
        Count++;
        if (Count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        guidTitle = gdpsData[1];
        guidLang = gdpsData[2];
        date = gdpsData[5];
        likes = gdpsData[6];
        guidImg = gdpsData[7];
        userId = gdpsData[8];

        html += 
        `<div class=framegdpsOld style="width:260px;height:210px" id="${id}">`+
            `<img width=276px height=133px src="${guidImg}" onerror="this.src='./imgs/empty.jpg'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:15px;border-top-right-radius:15px">`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="./imgs/${guidLang}.png"></h2>`+
            `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-black-alpha), var(--color-black));"></div>`+
            `<div style="bottom:12px;left:20px" class="absolute likezone">`+
                `<button data-trans="edit" onclick="editGuide(${id})" class=loginbtn style="margin-top:8px">${getTrans('edit')}</button>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
alarmsWindow = ()=>{
    let html = 
    `<div align=center>`+
        `<h1 data-trans="alarms01">${getTrans('alarms01')}</h1>`+
        `<div style="display:flex">`+
            `<div style="width:30%;height:400px">`+
                `<h2 data-trans="msgs">${getTrans('msgs')}</h2>`+
                `<div id=alarms_small>`+
                `</div>`+
            `</div>`+
            `<div style="width:70%;height:400px">`+
                `<h2 data-trans="fullMsgs">${getTrans('fullMsgs')}</h2>`+
                `<div id=alarms_big>`+
                `</div>`+
            `</div>`+
        `</div>`+
    `</div>`;
    return html;
},
GetAlarms = (page = 0)=>{
    setLink('alarms');
    Loading();
    helperRequest(`${sData[0]}getAlarms${sData[6]}?page=${page}`)
    .then(data => {
        Loading(1);
        if (data == '[]') 
            return getElement('alarms_small').innerHTML = `<span data-trans="newsNone">${getTrans('newsNone')}</span>`;
        let parsedData = JSON.parse(data),
            html = '';
        parsedData.forEach(el => {
            html += `<button id="btn${el[0]}" class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
        });
        getElement('alarms_small').innerHTML = html;
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
getFullAlarm = (id)=>{
    setLink('alarm='+id);
    Loading();
    helperRequest(`${sData[0]}getAlarm${sData[6]}?id=${id}`)
    .then(data => {
        Loading(1);
        let alarm = JSON.parse(data),
            html = 
        `<div id=fullAlarm align=left style=margin-left:12px>`+
            `<h1>${alarm.title}</h1>`+
            `<p>${alarm.text}</p>`+
            `<span data-trans=""addedBy>${getTrans('addedBy')}</span> - `+
            `<button class=emptybtn onclick="otherProfile(${alarm.adminId},'profilePage()')">${alarm.adminName}</button><br><br>`+
            `<button data-trans="delete" class=loginbtn onclick="removeAlarm(${alarm.ID})">${getTrans('delete')}</button>`+
        `</div>`;
        getElement('alarms_big').innerHTML = html;
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
dropWindow = ()=>{
    let html = pHeader()+
    `<div class="frameprofile" style="width:10vw%">`+
        `<h1 data-trans="passReset">${getTrans('passReset')}</h1>`+
        `<input data-trans="login01" id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text" placeholder="${getTrans('login01')}"><br><br>`+
        `<input data-trans="login04" id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password" placeholder="${getTrans('login04')}"><br><br>`+
        `<input data-trans="login05" id="LGemail" class="framelabel" required placeholder="${getTrans('login05')}"><br><br>`+
        `<p data-trans="passResetIf">${getTrans('passResetIf')}</p>`+
        `<button data-trans="submit" class=loginbtn onclick="sendDrop()">${getTrans('submit')}</button><br><br>`+
        `<button data-trans="back" class=loginbtn onclick="innerMain(profilePage())">${getTrans('back')}</button>`+
    `</div>`;
    return html;
},
addGdps = ()=>{
    setLink('addGdps');
    let html = 
    `<h1 data-trans="addGdps">${getTrans('addGdps')}</h1>`+
    `<form method=POST action='gdpsAdd${sData[6]}' onsubmit="return enterFormData(this,'gdpsAdd${sData[6]}')">`+
        `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
        `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}"></textarea><br>`+
        `<label data-trans="addGdps03">${getTrans('addGdps03')}</label><br><input data-trans="gdpsInput03" class=framelabel type=text name=database style=width:100% required placeholder="${getTrans('gdpsInput03')}"><br>`+
        `<label data-trans="addGdps04">${getTrans('addGdps04')}</label><br><input data-trans="gdpsInput04" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('gdpsInput04')}"><br>`+
        `<label data-trans="helperDs">${ getTrans('helperDs') }</label><br><input data-trans="gdpsInput05" class=framelabel type=text name=link style=width:100% required placeholder="${getTrans('gdpsInput05')}"><br><br>`+

        `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
            `<option data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
            `<option data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
            `<option data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
        `</select><br><br>`+

        `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
        `<div style="display:flex;flex-wrap:wrap">`+
            `<input id=T1 style=display:none name=tags[] type=checkbox value=1>`+
            `<label class=tagUns data-trans="GDtag01" for=T1 value=1>${getTrans('GDtag01')}</label>`+
            `<input id=T2 style=display:none name=tags[] type=checkbox value=2>`+
            `<label class=tagUns data-trans="GDtag02" for=T2 value=2>${getTrans('GDtag02')}</label>`+
            `<input id=T3 style=display:none name=tags[] type=checkbox value=3>`+
            `<label class=tagUns data-trans="GDtag03" for=T3 value=3>${getTrans('GDtag03')}</label>`+
            `<input id=T4 style=display:none name=tags[] type=checkbox value=4>`+
            `<label class=tagUns data-trans="GDtag04" for=T4 value=4>${getTrans('GDtag04')}</label>`+
            `<input id=T5 style=display:none name=tags[] type=checkbox value=5>`+
            `<label class=tagUns data-trans="GDtag05" for=T5 value=5>${getTrans('GDtag05')}</label>`+
            `<input id=T6 style=display:none name=tags[] type=checkbox value=6>`+
            `<label class=tagUns data-trans="GDtag06" for=T6 value=6>${getTrans('GDtag06')}</label>`+
            `<input id=T7 style=display:none name=tags[] type=checkbox value=7>`+
            `<label class=tagUns data-trans="GDtag07" for=T7 value=7>${getTrans('GDtag07')}</label>`+
            `<input id=T8 style=display:none name=tags[] type=checkbox value=8>`+
            `<label class=tagUns data-trans="GDtag08" for=T8 value=8>${getTrans('GDtag08')}</label>`+
            `<input id=T9 style=display:none name=tags[] type=checkbox value=9>`+
            `<label class=tagUns data-trans="GDtag09" for=T9 value=9>${getTrans('GDtag09')}</label>`+
            `<input id=T10 style=display:none name=tags[] type=checkbox value=10>`+
            `<label class=tagUns data-trans="GDtag10" for=T10 value=10>${getTrans('GDtag10')}</label>`+
            `<input id=T11 style=display:none name=tags[] type=checkbox value=11>`+
            `<label class=tagUns data-trans="GDtag11" for=T11 value=11>${getTrans('GDtag11')}</label>`+
        `</div><br>`+
        `<label data-trans="addGdps06">${getTrans('addGdps06')}</label><br>`+
        `<div style="display:flex;flex-wrap:wrap">`+
            `<input id=T12 style=display:none name=os[] type=checkbox value=12>`+
            `<label class=tagUns data-trans="GDtag12" for=T12 value=12>${getTrans('GDtag12')}</label>`+
            `<input id=T13 style=display:none name=os[] type=checkbox value=13>`+
            `<label class=tagUns data-trans="GDtag13" for=T13 value=13>${getTrans('GDtag13')}</label>`+
            `<input id=T14 style=display:none name=os[] type=checkbox value=14>`+
            `<label class=tagUns data-trans="GDtag14" for=T14 value=14>${getTrans('GDtag14')}</label>`+
            `<input id=T15 style=display:none name=os[] type=checkbox value=15>`+
            `<label class=tagUns data-trans="GDtag15" for=T15 value=15>${getTrans('GDtag15')}</label>`+
        `</div><br><br>`+
        `<input data-trans="addGdps" type=submit value="${getTrans('addGdps')}" class=loginbtn>`+
    `</form>`;
    return html;
},
editGdps = (gdpsId)=>{
    Loading();
    let html = ``;
    helperRequest(`${sData[1]}gdpsEdit${sData[6]}?id=${gdpsId}`)
    .then (data => {
        Loading(1);
        setLink('editGdps='+gdpsId);
        let parsedData = JSON.parse(data),
            Tags = JSON.parse(parsedData[5]),
            os = JSON.parse(parsedData[6]);
        html = 
            `<h1 data-trans="editGdps">${getTrans('editGdps')}</h1>`+
            `<form method=POST action='gdpsEdit${sData[6]}' onsubmit="return enterFormData(this,'gdpsEdit${sData[6]}?id=${gdpsId}')">`+
                `<label data-trans="addGdps01">${getTrans('addGdps01')}</label><br><input value="${parsedData[0]}" data-trans="gdpsInput01" class=framelabel type=text name=title style=width:100% required placeholder="${getTrans('gdpsInput01')}"><br>`+
                `<label data-trans="addGdps02">${getTrans('addGdps02')}</label><br><textarea data-trans="gdpsInput02" class=framelabel name=description style=width:100% required placeholder="${getTrans('gdpsInput02')}">${parsedData[1]}</textarea><br>`+
                `<label data-trans="addGdps03">${getTrans('addGdps03')}</label><br><input value="${parsedData[2]}" data-trans="gdpsInput03" class=framelabel type=text name=database style=width:100% required placeholder="${getTrans('gdpsInput03')}"><br>`+
                `<label data-trans="addGdps04">${getTrans('addGdps04')}</label><br><input value="${parsedData[3]}" data-trans="gdpsInput04" class=framelabel type=text name=img style=width:100% placeholder="${getTrans('gdpsInput04')}"><br>`+
                `<label data-trans="helperDs">${ getTrans('helperDs') }</label><br><input value="${parsedData[4]}" data-trans="gdpsInput05" class=framelabel type=text name=link style=width:100% required placeholder="${getTrans('gdpsInput05')}"><br><br>`+
                
                `<label data-trans="gdpsLang00">${getTrans('gdpsLang00')}</label><br>`+
                `<select id="language" class="framelabel" name="language" required>`+
                    `<option ${parsedData[7] == 'RU' ? 'selected' : ''} data-trans="gdpsLang01" value="RU">${getTrans('gdpsLang01')}</option>`+
                    `<option ${parsedData[7] == 'EN' ? 'selected' : ''} data-trans="gdpsLang02" value="EN">${getTrans('gdpsLang02')}</option>`+
                    `<option ${parsedData[7] == 'ES' ? 'selected' : ''} data-trans="gdpsLang03" value="ES">${getTrans('gdpsLang03')}</option>`+
                `</select><br><br>`+

                `<label data-trans="addGdps05">${getTrans('addGdps05')}</label><br>`+
                
                `<div style="display:flex;flex-wrap:wrap">`+
                    `<input ${ Tags.includes("1") ? 'checked' : '' } id=T1 style=display:none name=tags[] type=checkbox value=1>`+
                    `<label class=tagUns data-trans="GDtag01" for=T1 value=1>${getTrans('GDtag01')}</label>`+
                    `<input ${ Tags.includes("2") ? 'checked' : '' } id=T2 style=display:none name=tags[] type=checkbox value=2>`+
                    `<label class=tagUns data-trans="GDtag02" for=T2 value=2>${getTrans('GDtag02')}</label>`+
                    `<input ${ Tags.includes("3") ? 'checked' : '' } id=T3 style=display:none name=tags[] type=checkbox value=3>`+
                    `<label class=tagUns data-trans="GDtag03" for=T3 value=3>${getTrans('GDtag03')}</label>`+
                    `<input ${ Tags.includes("4") ? 'checked' : '' } id=T4 style=display:none name=tags[] type=checkbox value=4>`+
                    `<label class=tagUns data-trans="GDtag04" for=T4 value=4>${getTrans('GDtag04')}</label>`+
                    `<input ${ Tags.includes("5") ? 'checked' : '' } id=T5 style=display:none name=tags[] type=checkbox value=5>`+
                    `<label class=tagUns data-trans="GDtag05" for=T5 value=5>${getTrans('GDtag05')}</label>`+
                    `<input ${ Tags.includes("6") ? 'checked' : '' } id=T6 style=display:none name=tags[] type=checkbox value=6>`+
                    `<label class=tagUns data-trans="GDtag06" for=T6 value=6>${getTrans('GDtag06')}</label>`+
                    `<input ${ Tags.includes("7") ? 'checked' : '' } id=T7 style=display:none name=tags[] type=checkbox value=7>`+
                    `<label class=tagUns data-trans="GDtag07" for=T7 value=7>${getTrans('GDtag07')}</label>`+
                    `<input ${ Tags.includes("8") ? 'checked' : '' } id=T8 style=display:none name=tags[] type=checkbox value=8>`+
                    `<label class=tagUns data-trans="GDtag08" for=T8 value=8>${getTrans('GDtag08')}</label>`+
                    `<input ${ Tags.includes("9") ? 'checked' : '' } id=T9 style=display:none name=tags[] type=checkbox value=9>`+
                    `<label class=tagUns data-trans="GDtag09" for=T9 value=9>${getTrans('GDtag09')}</label>`+
                    `<input ${Tags.includes("10") ? 'checked' : '' } id=T10 style=display:none name=tags[] type=checkbox value=10>`+
                    `<label class=tagUns data-trans="GDtag10" for=T10 value=10>${getTrans('GDtag10')}</label>`+
                    `<input ${Tags.includes("11") ? 'checked' : '' } id=T11 style=display:none name=tags[] type=checkbox value=11>`+
                    `<label class=tagUns data-trans="GDtag11" for=T11 value=11>${getTrans('GDtag11')}</label>`+
                `</div><br>`+
                `<label data-trans="addGdps06">${getTrans('addGdps06')}</label><br>`+
                `<div style="display:flex;flex-wrap:wrap">`+
                    `<input ${os.includes("12") ? 'checked' : ''} id=T12 style=display:none name=os[] type=checkbox value=12>`+
                    `<label class=tagUns data-trans="GDtag12" for=T12 value=12>${getTrans('GDtag12')}</label>`+
                    `<input ${os.includes("13") ? 'checked' : ''} id=T13 style=display:none name=os[] type=checkbox value=13>`+
                    `<label class=tagUns data-trans="GDtag13" for=T13 value=13>${getTrans('GDtag13')}</label>`+
                    `<input ${os.includes("14") ? 'checked' : ''} id=T14 style=display:none name=os[] type=checkbox value=14>`+
                    `<label class=tagUns data-trans="GDtag14" for=T14 value=14>${getTrans('GDtag14')}</label>`+
                    `<input ${os.includes("15") ? 'checked' : ''} id=T15 style=display:none name=os[] type=checkbox value=15>`+
                    `<label class=tagUns data-trans="GDtag15" for=T15 value=15>${getTrans('GDtag15')}</label>`+
                `</div><br><br>`+
                `<input data-trans="editGdps" type=submit value="${getTrans('editGdps')}" class=loginbtn><br>`+
                `<p data-trans="afterGD">${getTrans('afterGD')}</p><br>`+
            `</form>`;
        innerProfile(html);
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},

otherProfileMini = (userId)=>{
    setLink('profiles='+userId);
    Loading();
    helperRequest(`${sData[0]}getUser${sData[6]}?id=${userId}`)
    .then(data => {
        Loading(1);
        let userData = JSON.parse(data),
            accStatus = userData[3] ? getTrans('isActive') : getTrans('isNotact'),
            html = 
        `<h1><span data-trans="notYourProf">${getTrans('notYourProf')}</span> ${userData[0]}</h1>`+
        `<p><spandata-trans="profName">${getTrans('profName')}</span>: ${userData[0]}</p>`+
        `<p><spandata-trans="profId">${ getTrans('profId') }</span>: ${userData[1]}</p>`+
        `<p><spandata-trans="profRole">${getTrans('profRole')}</span>: ${toStringRole(userData[2])}</p>`+
        `<p><span data-trans="notProfAccs">${getTrans('notProfAccs')}</span> ${userData[0]} <span data-trans="${userData[3] ? 'isActive' : 'isNotact'}">${accStatus}</span></p>`;
        innerProfile(html);
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
otherGdpsesWindow = (userId)=>{
    setLink('profGdpses='+userId);
    Loading();
    helperRequest(`${sData[0]}getAddedGdpses${sData[6]}?id=${userId}&type=0`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data),
            gdpses = "";
        parsedData.forEach((gdps) => {
            if (typeof(gdps) == 'object') {
                gdpses+=GDPSrenderInProfile(gdps);
            };
        });
        let html =
        `<h1><span data-trans="notYourGdpses">${getTrans('notYourGdpses')}</span> ${parsedData[0]}</h1><br>`+
        `<div style='display: flex; flex-direction: column; height:calc(100vh - 380px); overflow:auto' align=left>`+
            gdpses+
        `</div>`;
        innerProfile(html);
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
otherGuidesWindow = (userId)=>{
    setLink('profGuides='+userId);
    Loading();
    helperRequest(`${sData[0]}getUserGuides${sData[6]}?id=${userId}`)
    .then(data => {
        Loading(1);
        let parsedData = JSON.parse(data),
            gdpses = "";
        parsedData.forEach(gdps => {
            if (typeof(gdps) == 'object') {
                gdpses+=GUIDrenderInProfile(gdps);
            }
        });
        let html =
        `<h1><span data-trans="guides00">${getTrans('guides00')}</span> ${parsedData[0]}</h1><br>`+
        `<div style='display:flex;align-items:center;flex-wrap:wrap;flex-direction:row' align=left>`+
            gdpses+
        `</div>`;
        innerProfile(html);
    })
    .catch((error)=>{console.error(error);returnError(error+servError)});
},
GDPSrenderInProfile = (parsedData)=>{
    let html = '',
        Count = 0,

        gdpsData = null,
        id = null,
        gdpsTitle = null,
        description = null,
        likesCount = null,
        userId = null,
        username = null,
        pictureLink = null,
        renderJoinLink = null,
        isWeeklyData = ['',''],
        isWeekly,
        link,
        database,
        checked,
        coowner,
        owner;
    
    for (let Id in parsedData) {
        Count++;
        if (Count == 9)
            return html;
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        gdpsTitle = gdpsData[1];
        description = gdpsData[2];
        likesCount = gdpsData[5];
        userId = gdpsData[6];
        username = gdpsData[7];
        pictureLink = gdpsData[8];
        renderJoinLink = gdpsData[9];
        isWeekly = gdpsData[10];
        link = gdpsData[11];
        database = gdpsData[12];
        checked = gdpsData[13];
        coowner = gdpsData[14];
        owner = gdpsData[15];

        renderJoinLink = renderJoinLink ? null : `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target=_blank>${getTrans('joinToGdps')}</a>`;

        isWeeklyData = ['',''];

        html += 
        `<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${id}">`+
            `${isWeeklyData[1]}`+
            `<h2 style="display:inline;margin-right:4px">${gdpsTitle}</h2>`+
            `<p style="display:inline;margin:0">`+
                `<span data-trans="addedBy">${getTrans('addedBy')}</span>:`+
                `<button onclick="otherProfile(${userId},'innerMain(pageList())')" style="background:0;border:0;color:white">${username}</button>`+
            `</p>`+
            `<div style="min-height:32px">`+
                `<img onerror="this.src='./imgs/empty.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:6px">`+
                `<p>${description}</p>`+
            `</div>`+
            `<div style="margin-top:15px">`+
                `<a class="loginbtn" data-trans="joinToGdps" href="join${sData[6]}?id=${id}" target="_blank">${getTrans('joinToGdps')}</a>`+
            `</div>`+
        `</div>`;
    };
    return html;
},
GUIDrenderInProfile = (parsedData)=>{
    let html = '',
        Count = 0,
        
        gdpsData = null,
        id = null,
        guidTitle = null,
        guidLang = null,
        date = null,
        likes = null,
        guidImg = null,
        userId = null;

    for (let Id in parsedData) {
        
        gdpsData = parsedData[Id];
        id = gdpsData[0];
        guidTitle = gdpsData[1];
        guidLang = gdpsData[2];
        date = gdpsData[5];
        likes = gdpsData[6];
        guidImg = gdpsData[7];
        userId = gdpsData[8];

        html += 
        `<div class=framegdpsOld style="width:260px;height:200px" id="${id}">`+
            `<img width=276px height=133px src="${guidImg}" onerror="this.src='./imgs/empty.jpg'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:15px;border-top-right-radius:15px">`+
            `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img src="./imgs/${guidLang}.png"></h2>`+
            `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-black-alpha), var(--color-black));"></div>`+
            `<div style="bottom:12px;left:20px" class="absolute likezone">`+
                `<button data-trans="moreInfo" onclick="GetGuide(${id})" class=loginbtn style="margin-top:8px">${getTrans('moreInfo')}</button>`+
            `</div>`+
        `</div>`;
    };
    return html;
},// ###END_REGION

// ###ADMIN_REGION
adminPanel = ()=>{
    setLink('admin');
    let html = pHeader()+
    `<div class="frameprofile">`+
        `<h1>Admin Panel!!1</h1>`+
        `<p>build 2</p>`+
        `<button class=loginbtn onclick="ADwrite(0)">Write Alarm</button><br>`+
        `<h2>Weekly GDPS</h2>`+
        `<input id="framelabel" class="framelabel">`+
        `<button class="loginbtn" onclick="AsendWeekly()">Set</button><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="gdpses">`+
                `</tbody>`+
            `</table>`+
        `</div><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="textures">`+
                `</tbody>`+
            `</table>`+
        `</div><br>`+
        `<div style="background-color:#000000;height:300px;overflow:auto">`+
            `<table>`+
                `<tbody id="guides">`+
                `</tbody>`+
            `</table>`+
        `</div>`+
    `</div>`+
    `<div id=gdpsframe class=frameprofile style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
        `<h1>GDPS EDIT!1!</h1>`+
        `<p>tags</p>`+
        `<label>Старее 2.1:</label>`+
        `<input value=1 type=checkbox name=tags id=tag1><br>`+
        `<label>2.1:</label>`+
        `<input value=2 type=checkbox name=tags id=tag2><br>`+
        `<label>2.2:</label>`+
        `<input value=3 type=checkbox name=tags id=tag3><br>`+
        `<label>Малый сервер:</label>`+
        `<input value=4 type=checkbox name=tags id=tag4><br>`+
        `<label>Большой сервер:</label>`+
        `<input value=5 type=checkbox name=tags id=tag5><br>`+
        `<label>Бесплатный хостинг:</label>`+
        `<input value=6 type=checkbox name=tags id=tag6><br>`+
        `<label>Личный хостинг:</label>`+
        `<input value=7 type=checkbox name=tags id=tag7><br>`+
        `<label>Заказной хостинг:</label>`+
        `<input value=8 type=checkbox name=tags id=tag8><br>`+
        `<label>Модификации:</label>`+
        `<input value=9 type=checkbox name=tags id=tag9><br>`+
        `<label>Текстуры:</label>`+
        `<input value=10 type=checkbox name=tags id=tag10><br>`+
        `<label>Встроенные читы:</label>`+
        `<input value=11 type=checkbox name=tags id=tag11><br>`+
        `<p>os's</p>`+
        `<label>Windows:</label>`+
        `<input value=12 type=checkbox name=os id=os12><br>`+
        `<label>MacOS:</label>`+
        `<input value=13 type=checkbox name=os id=os13><br>`+
        `<label>Android:</label>`+
        `<input value=14 type=checkbox name=os id=os14><br>`+
        `<label>IOS:</label>`+
        `<input value=15 type=checkbox name=os id=os15><br>`+
        `<br><button onclick="getElement('gdpsframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(0,this.value)" id=sendgdps value=0 class=loginbtn>send</button>`+
    `</div>`+
    `<div id=textframe class=frameprofile style=position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none>`+
        `<h1>TEXT EDIT!1!</h1>`+
        `<p>tags</p>`+
        `<label>1.9:</label>`+
        `<input value=1 type=checkbox name=tagz id=tak1><br>`+
        `<label>2.0:</label>`+
        `<input value=2 type=checkbox name=tagz id=tak2><br>`+
        `<label>2.1:</label>`+
        `<input value=3 type=checkbox name=tagz id=tak3><br>`+
        `<label>2.2:</label>`+
        `<input value=4 type=checkbox name=tagz id=tak4><br>`+
        `<label>Недоделаный:</label>`+
        `<input value=5 type=checkbox name=tagz id=tak5><br>`+
        `<label>Изменены звуки:</label>`+
        `<input value=6 type=checkbox name=tagz id=tak6><br>`+
        `<label>Изменена музыка:</label>`+
        `<input value=7 type=checkbox name=tagz id=tak7><br>`+
        `<label>Изменены иконки:</label>`+
        `<input value=8 type=checkbox name=tagz id=tak8><br>`+
        `<label>Изменены блоки:</label>`+
        `<input value=9 type=checkbox name=tagz id=tak9><br>`+
        `<p>os's</p>`+
        `<label>Low:</label>`+
        `<input value=12 type=checkbox name=oz id=oz12><br>`+
        `<label>Medium:</label>`+
        `<input value=13 type=checkbox name=oz id=oz13><br>`+
        `<label>High:</label>`+
        `<input value=14 type=checkbox name=oz id=oz14><br>`+
        `<label>Есть на Android:</label>`+
        `<input value=15 type=checkbox name=oz id=oz15><br>`+
        `<br><button onclick="getElement('textframe').style.display='none'" class=loginbtn>close</button>`+
        `<button onclick="Asend(1,this.value)" id=sendtext value=0 class=loginbtn>send</button>`+
    `</div>`;
    innerMain(html);
    Loading();
    helperRequest(`${sData[2]}!takeAll${sData[6]}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);

            let prepender = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>Checked</th>'+
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+
                '<th class=tR>Name</th>'+
            '</tr>',

                prepender2 = '<tr style=position:sticky;top:2px;background-color:#000>'+
                '<th class=tR>ID</th>'+
                '<th class=tR>Checked</th>'+
                '<th class=tR>Activate</th>'+
                '<th class=tR>Ban</th>'+
                '<th class=tR>Delete</th>'+
                '<th class=tR>SuperAction</th>'+
                '<th class=tR>title</th>'+
                '<th class=tR>picture</th>'+
            '</tr>',

                serverResp = JSON.parse(data);
            ADgdpses = serverResp[0];
            ADtextures = serverResp[1];
            ADguides = serverResp[2];
            DCgdpses(prepender);
            DCtextures(prepender);
            DCguides(prepender2);
            for (let i = 0; i < ADgdpses.length; i++) {
                DCgdpses(ADrender(ADgdpses[i], 'g', 0));
            }
            for (let i = 0; i < ADtextures.length; i++) {
                DCtextures(ADrender(ADtextures[i], 't', 1));
            }
            for (let i = 0; i < ADguides.length; i++) {
                DCguides(ADrender(ADguides[i], 'h', 2));
            }
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});

},

// написать аларм
ADwrite = (userId, inputText = '')=>{
    let html = 
    `<div class=framemenu id=F45>`+
        `<h1>Write Alarm!!!</h1>`+
        `<form onsubmit="return enterFormData(this,'writeAlarm${sData[6]}')">`+
            (userId == 0 ?
                `<input placeholder="userId (not username)" class=framelabel name=user><br>` :
                `<input name=user value=${userId} type=hidden>`
            )+
            `<input placeholder=title class=framelabel name=title value="${inputText}"><br>`+
            `<textarea placeholder=text class=framelabel name=text></textarea><br>`+
            `<button onclick="getElement('F45').remove()" class=loginbtn>close</button>`+
            `<input type=submit value=send class=loginbtn>`+
        `</form>`+
    `</div>`;
    innerMain(html,1);
},

// первые 3 функции - воткнуть в нужную часть админ панели, ADrender рендерит контент и потом втыкает
DCgdpses = (textContent)=>{
    return getElement('gdpses').insertAdjacentHTML('beforeend', textContent);
},
DCtextures = (textContent)=>{
    return getElement('textures').insertAdjacentHTML('beforeend', textContent);
},
DCguides = (textContent)=>{
    return getElement('guides').insertAdjacentHTML('beforeend', textContent);
},
ADrender = (array, contentType = 'g', intType = 0)=>{
    let html = '';

    html += 
    `<tr id=${contentType+array[0]}>`+
        `<td>${array[0]}</td>`+
        `<td><g id=A${contentType}${array[0]}>${array[6]}</g></td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(0,${array[0]},${intType},"activate")>Activate</button>`+
        `</td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(${array[7]},${array[0]},${intType},"ban")>Ban</button>`+
        `</td>`+
        `<td>`+
            `<button class=loginbtn onclick=Aaction(${array[7]},${array[0]},${intType},"delete")>Delete</button>`+
        `</td>`;

    if (contentType == 'g') {
        html += 
        `<td>`+
        `<button class=loginbtn onclick=AgdpsEDIT(${array[0]})>Edit GDPS</button>`+
        `<button class=loginbtn onclick=helperContent('gdps',${array[0]},'&ad')>open</button>`+
        `</td>`;
    } else if (contentType == 't') {
        html += 
        `<td>`+
            `<button class=loginbtn onclick=AtextEDIT(${array[0]})>Edit TEXT</button>`+
            `<button class=loginbtn>open (blocked)</button>`+
        `</td>`;
    } else if (contentType == 'h') {
        html += 
        `<td>`+
            `<button class=loginbtn onclick=GetGuide(${array[0]})>open</button>`+
        `</td>`;
    };

    html += `<td>${array[1]}</td>`;
    if (contentType == 'h') {
        html += `<td>${array[2]}</td>`;
    }
    html += `</tr>`;

    return html;
},

// установить викли гдпс
AsendWeekly = ()=>{
    let id = getElement('framelabel').value;
    Loading();
    helperRequest(`${sData[2]}Aaction${sData[6]}?weekly=${id}`)
        .then(() => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            alert('DONE');
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
// бан/разбан/удаление
Aaction = (userId, id, contentType, action)=>{
    let action2 = '';
    switch (action) {
        case "ban":
            action2 = 'Бан вашего сервера';
            break;
        case "delete":
            action2 = 'Удаление вашего сервера';
            break;
    };
    if (userId != 0)
        ADwrite(userId, action2);
    Loading();
    helperRequest(`${sData[2]}Aaction${sData[6]}?id=${id}&type=${contentType}&action=${action}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            let t = '';
            switch (contentType) {
                case 0:
                    t = 'g';
                    break;
                case 1:
                    t = 't';
                    break;
                case 2:
                    t = 'h';
                    break;
            }
            
            if (data == '1')
                console.log(getElement('A'+t+id).innerHTML = 1);
            if (data == '-1')
                console.log(getElement('A'+t+id).innerHTML = -1);
            if (data == '-2')
                console.log(getElement(t+id).remove());
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
},
// изменение тегов у гдпсов
AgdpsEDIT = (id)=>{
    getElement('gdpsframe').style.display = 'block';
    getElement('sendgdps').value = id;
    let errei = findSubarrayById(id, ADgdpses),
        tagz = JSON.parse(errei[2]),
        oz = JSON.parse(errei[3]),

        chkb = document.querySelectorAll('input[type="checkbox"][name="tags"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });

    chkb = document.querySelectorAll('input[type="checkbox"][name="os"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (getElement('tag'+tagz[i]))
            getElement('tag'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (getElement('os'+oz[i]))
            getElement('os'+oz[i]).checked = true;
    };
},
AtextEDIT = (id)=>{
    getElement('textframe').style.display = 'block';
    getElement('sendtext').value = id;
    let errei = findSubarrayById(id, ADtextures),
        tagz = JSON.parse(errei[2]),
        oz = JSON.parse(errei[3]),

        chkb = document.querySelectorAll('input[type="checkbox"][name="tagz"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });

    chkb = document.querySelectorAll('input[type="checkbox"][name="oz"]');
    chkb.forEach((ch)=>{
        ch.checked = false;
    });
    
    chkb = null;
    
    for (let i = 0; i < tagz.length; i++) {
        console.log('t'+tagz[i]);
        if (getElement('tak'+tagz[i]))
            getElement('tak'+tagz[i]).checked = true;
    };

    for (let i = 0; i < oz.length; i++) {
        console.log('o'+oz[i]);
        if (getElement('oz'+oz[i]))
            getElement('oz'+oz[i]).checked = true;
    };
},
findSubarrayById = (id, arrat)=>{
    for (var i = 0; i < arrat.length; i++) {
        if (arrat[i][0] === id) {
            return arrat[i];
        }
    }
    return null; // Возвращаем null, если подмассив с заданным id не найден
},
Asend = (type, id)=>{
    let Tags = '',
        os = '';

    if (type == 0) {
        getElement('gdpsframe').style.display = 'none';
        Tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tags"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="os"]:checked'))
            .map(checkbox => checkbox.value));
    } else {
        getElement('textframe').style.display = 'none';
        Tags = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="tagz"]:checked'))
            .map(checkbox => checkbox.value));

        os = JSON.stringify(Array.from(document.querySelectorAll('input[type="checkbox"][name="oz"]:checked'))
            .map(checkbox => checkbox.value));
    }

    Loading();
    helperRequest(`${sData[2]}Aedit${sData[6]}?id=${id}&type=${type}&tags=${Tags}&os=${os}`)
        .then(data => {
            Loading(1);
            if (data == 'Access denied')
                return returnError(data);
            alert('DONE FOR '+id);
        })
        .catch((error)=>{console.error(error);returnError(error+servError)});
};// ###END_REGION

let 
token = Slocal.getItem('helperUser'), // токен юзера
// isLogged = 0, // есть вход в аккаунт или нету, заменена на условие "thisUser[1] === 0"
thisUser = [
    '???', // ник
    0, // айди
    0, // роль
    0, // активирован или нет
    0, // есть ли алармы или нет
    // обычно тут временно хранится токен
],
mainLang = Slocal.getItem('helperLang'), // язык, хотя вроде очевидно
servError = "\n\nSERVER RESP:\n\n  +xhr.response", // если 'helperRequest' вернёт ошибку, она будет записана сюда и отображена через 'returnError()'

// две переменные ниже работают с функциями HELPERFIND_REGION
helperFindData = [0,[],[]],// нулевой это метод поиска, первый просто теги, второй платформы

// переменные для кеша в поиске
CacheGDPSes = [],
CacheGuides = [],

// переменные для кеша в профилях
myGdpses = [],
myguides = [],

// переменные для кеша в чужих профилях
otherUser = [],
otherGdpses = [],

// кеш переменные админ панели, при вызове 'adminPanel()' в них вставляется ответ из 'helperRequest()', потом рендерится
ADgdpses = [],
ADtextures = [],
ADguides = [],

ignore = false, // работает с функцией 'setLink', если true то сохранение состояния в истории вкладок не будет

lastUsed = 'fetchNew(0,1)', // гдпсы
lastUsed3 = "helperContent('gdps',45)", // переход в профиле

guideEditorFrame = 0, // используется только в редакторе гайдов чтобы можно было удалять разделы не по порядку
errorCount = 0, // используется в returnError()

colorMenu = ()=>{
    let html = ``;
    innerMain(profilePage(html));
},

helperRecolor = (colorId, colorString = '')=>{
    let oldColor = '',
        colors = '';
    switch (colorId) {
        case 0:
            oldColor = Slocal.helperColorMain;
            colors = getElement('stule').innerHTML.replace(`-main:rgb(${oldColor})`, `-main:rgb(${colorString})`);
            getElement('stule').innerHTML = colors;
            Slocal.helperColorMain = colorString;
            break;
        case 1:
            oldColor = Slocal.helperColorLight;
            colors = getElement('stule').innerHTML.replace(`-light:rgb(${oldColor})`, `-light:rgb(${colorString})`);
            getElement('stule').innerHTML = colors;
            Slocal.helperColorLight = colorString;
            break;
        case 2:
            oldColor = Slocal.helperColorWeekly;
            colors = getElement('stule').innerHTML.replace(`-weekly:rgb(${oldColor})`, `-weekly:rgb(${colorString})`);
            getElement('stule').innerHTML = colors;
            colors = getElement('stule').innerHTML.replace(`-weekly-alpha:rgba(${oldColor},.6)`, `-weekly-alpha:rgba(${colorString},.6)`);
            getElement('stule').innerHTML = colors;
            Slocal.helperColorWeekly = colorString;
            break;
        case 3:
            oldColor = Slocal.helperColorBlack;
            colors = getElement('stule').innerHTML.replace(`-black:rgb(${oldColor})`, `-black:rgb(${colorString})`);
            getElement('stule').innerHTML = colors;
            colors = getElement('stule').innerHTML.replace(`-black-alpha:rgba(${oldColor},.6)`, `-black-alpha:rgba(${colorString},.6)`);
            getElement('stule').innerHTML = colors;
            Slocal.helperColorBlack = colorString;
            break;
        case 4:
            document.body.style.backgroundColor = `rgb(${colorString})`;
            Slocal.helperColor = colorString;
            break;
        case 5:
            colors = getElement('stule').innerHTML
            .replace(`-main:rgb(157,97,42)`, `-main:rgb(${Slocal.helperColorMain})`)
            .replace(`-light:rgb(255,134,0)`, `-light:rgb(${Slocal.helperColorLight})`)
            .replace(`-weekly:rgb(189,99,0)`, `-weekly:rgb(${Slocal.helperColorWeekly})`)
            .replace(`-weekly-alpha:rgba(189,99,0,.6)`, `-weekly:rgb(${Slocal.helperColorWeekly},.6)`)
            .replace(`-black:rgb(29,28,22)`, `-black:rgb(${Slocal.helperColorBlack})`)
            .replace(`-black-alpha:rgba(29,28,22,.6)`, `-black-alpha:rgba(${Slocal.helperColorBlack},.6)`);
            getElement('stule').innerHTML = colors;
            document.body.style.backgroundColor = `rgb(${Slocal.helperColor})`;
            break;
            document.body.style.backgroundColor = `rgb(${colorString})`;
            Slocal.helperColor = colorString;
            break;
        case 6:
            colors = getElement('stule').innerHTML
            .replace(`-main:rgb(${Slocal.helperColorMain})`,`-main:rgb(157,97,42)`)
            .replace(`-light:rgb(${Slocal.helperColorLight})`,`-light:rgb(255,134,0)`)
            .replace(`-weekly:rgb(${Slocal.helperColorWeekly})`,`-weekly:rgb(189,99,0)`)
            .replace(`-weekly:rgb(${Slocal.helperColorWeekly},.6)`, `-weekly-alpha:rgba(189,99,0,.6)`)
            .replace(`-black:rgb(${Slocal.helperColorBlack})`,`-black:rgb(29,28,22)`)
            .replace(`-black-alpha:rgba(${Slocal.helperColorBlack},.6)`,`-black-alpha:rgba(29,28,22,.6)`);
            getElement('stule').innerHTML = colors;
            document.body.style.backgroundColor = `rgb(${Slocal.helperColor})`;
            
            Slocal.removeItem('helperColor');
            Slocal.removeItem('helperColorMain');
            Slocal.removeItem('helperColorLight');
            Slocal.removeItem('helperColorWeekly');
            Slocal.removeItem('helperColorWeekly');
            Slocal.removeItem('helperColorBlack');
            Slocal.removeItem('helperColorBlack');
    }
},

TimeOut = [null,null];
// [0] для инпута, [1] для анимаций окон (регистрация и логин)

if (!Slocal.helperColor) {
    Slocal.helperColor = '12,12,3'; // bg
    Slocal.helperColorMain = '157,97,42';
    Slocal.helperColorLight = '255,134,0';
    Slocal.helperColorWeekly = '189,99,0';
    Slocal.helperColorBlack = '29,28,22';
}

if (!Slocal.getItem('helperLang') || Slocal.getItem('helperLang') == 'Ru') {
    mainLang = 'RU';
    Slocal.setItem('helperLang', 'RU');
};

window.addEventListener('popstate', ()=>{
    ignore = true;
    getLink();
});

window.addEventListener('input', function() {
    let INPUT = getElement('gdpsNameInput').value;
    clearTimeout(TimeOut[0]);
    if (INPUT != '') {
        TimeOut[0] = setTimeout(() => {
            sendFinder();
        }, 300);
    }
});

reStart();