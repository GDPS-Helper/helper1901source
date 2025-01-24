<meta name=viewport content="width=device-width,initial-scale=1.0">
<meta charset="UTF-8">

<style>
    * {
        color: white;
        background-color: #333;
    }
    .codeBlock {
        background-color: #222;
    }
    .codeBlock2 {
        border: solid #222;
        border-radius: 16px;
        background-color: #222;
        overflow: auto;
    }
    .codeBlock3 {
        background-color: #222;
        margin-left: 16px;
    }
    h1, p {
        font-family: 'Poppins', sans-serif;
    }
</style>

<h1>краткий гайд на helperApi-v1</h1>

<p>Адрес самого API думаю очевиден - <a href=https://gdpshelper.xyz/api/v1/>https://gdpshelper.xyz/api/v1/</a>, все запросы отправляются через GET</p>

<h2>getUserData</h2>
<p>?id= Айди пользователя на сайте</p>
<div class=codeBlock2><pre class=codeBlock3><code class=codeBlock>{
    "userData": {
        "username"
        "userId"
        "roleId"
        "isActive"
    },
    "gdpsData": {
        "g": [
            "gdpsId"
            "title"
            "text" //описание сервера
            "tags"
            "os" //"операционная система"
            "likes"
            "picture"
            "joinStatus" //требуется ли вход для получения ссылки на дискорд
            "isWeekly"
            "language"
        ] //Массивов может быть много и через запятую
    },
    "textData": {
        "t": [
            "gdpsId"
            "title"
            "text" //описание Текстурпака
            "tags"
            "os" //"платформа"
            "likes"
            "picture"
        ] //Массивов может быть много и через запятую
    }
}</code></pre></div><br><br>


<h2>getGdps</h2>
<p>?id= айди гдпса на сайте</p>
<div class=codeBlock2><pre class=codeBlock3><code class=codeBlock>{
    "gdpsId"
    "title"
    "text" //описание сервера
    "tags"
    "os" //"операционная система"
    "likes"
    "picture"
    "joinStatus" //требуется ли вход для получения ссылки на дискорд
    "isWeekly"
    "language"
    "username" //имя пользователя, добавившего гдпс
    "userId" //то же самое что выше, но айди
    "gdpsStats": { //пока собирает только с фрутспейса
        "levels"
        "users"
    }
}</code></pre></div><br><br>


<h2>getText</h2>
<p>?id= айди текстурпака на сайте</p>
<div class=codeBlock2><pre class=codeBlock3><code class=codeBlock>{
    "gdpsId" //у текстурпаков айди называется gdpsId
    "title"
    "text" //описание текстур
    "tags"
    "os" //"операционная система"
    "likes"
    "picture"
    "Android" //ссылка на скачивание для мобилы
    "PC" //ссылка на скачивание для пк
    "username" //имя пользователя, добавившего текстуры
    "userId" //то же самое что выше, но айди
}</code></pre></div>