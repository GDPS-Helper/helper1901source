<?php

// ключи для капчи, по названию переменных понятно
$siteKey = 'put_your_here';
$secretKey = 'put_your_here';

//для комментов
$WHcomms = 'put_your_here';

//для репортов
$reportUrl = 'put_your_here';

//ГДПСы, формируется в Webhook() как $GDPScomm1.$gdps->gdpsId.$GDPScomm2.$comm->text
$GDPScomm1 = 'Коммент к контенту (группа комментов; айди контента) ';
$GDPScomm2 = '
его текст
';
$GDPScomm3 = 'Новая новость!!! гдпсайди ';

$GDPSuncomm1 = 'Удалён комментарий, канал - ';
$GDPSuncomm2 = 'Удалена новость ';

//Текстурпаки, формируется в Webhook() как $TEXTcomm1.$gdps->gdpsId.$TEXTcomm2.$comm->text
$TEXTcomm1 = 'Коммент к Текстурам под https://gdpshelper.xyz/textures/gdps.php?id=';
$TEXTcomm2 = '
его текст
';

//а это уже гайды, формируется как $GUIDcomm1.$whereiz.$GUIDcomm2.$comm->text
$GUIDcomm1 = 'Коммент к гайду под https://gdpshelper.xyz/guides/';
$GUIDcomm2 = '
его текст
';

//Новости гдпсов, дада надо
$NEWStext1 = 'Новый пост в новостях от ';
$NEWStext2 = '!
gdpsId - ';
$NEWStext3 = '
текст поста таков:
';

// формируется как User::Webhook($WHcomms, $NEWStext1.$user->username.$NEWStext2.$gdpsid.$NEWStext3.$text2);

//дальше идут логи для гдпсов и текстурпаков, прописал я им один вебхук
$WHcontent = 'put_your_here';

//отдельно для гдпса недели
$GDPSweek = 'Новый ГДПС Недели https://gdpshelper.xyz/list/gdps.php?id=';

$GDPSadd = 'Новый гдпс! Название:
';
$GDPSedit = 'Изменён гдпс! ссылка:
https://gdpshelper.xyz/list/gdps.php?id=';
$TEXTadd = 'Новые текстуры! Название:
';
$TEXTedit = 'Изменены текстуры! ссылка:
https://gdpshelper.xyz/textures/texure.php?id=';
//У всех них генерация такая $?.$gdps->gdpsId

// логи поиска текстур и гдпсов,
$WHsearch = 'put_your_here';
$GDPStags = 'Поиск ГДПС по тегам - ';
$GDPSname = 'Поиск ГДПС по имени - ';
$GDPSlike = 'ГДПС Самое лайкнутое';
$GDPSdisl = 'ГДПС Самое дизлайкнутое';
$GDPSrecn = 'ГДПС пусто';
$GDPSmods = 'ГДПС Модеры';
$GDPScont = 'ГДПС контест';

$TEXTtags = 'Поиск ТПАК по тегам - ';
$TEXTname = 'Поиск ТПАК по имени - ';
$TEXTlike = 'ТПАК Самое лайкнутое';
$TEXTdisl = 'ТПАК Самое дизлайкнутое';
$TEXTrecn = 'ТПАК пусто';

//У всех них генерация разная

//логи инструментов администрации

$WHadmin = 'put_your_here';
$GDPSban = 'Забанен ГДПС - ';
$GDPSunban = 'Разбанен ГДПС - ';
$GDPSdelete = 'Удалён ГДПС - ';
$TEXTban = 'Забанен ТПАК - ';
$TEXTunban = 'Разбанен ТПАК - ';
$TEXTdelete = 'Удалён ТПАК - ';
$GUIDban = 'Забанен ГАЙД - ';
$GUIDunban = 'Разбанен ГАЙД - ';
$GUIDdelete = 'Удалён ГАЙД - ';
$USERrole1 = 'Пользователю ';
$USERrole2 = ' выдали роль с ID ';

$WHreport = 'put_your_here';

//User::Webhook($WHadmin, $GDPSban.$_GET['id']);

//Вебхуки заранее для вставки

/*
//addGdps.php
User::Webhook($WHcontent, $GDPSadd.$title);

//editGdps.php
User::Webhook($WHcontent, $GDPSedit.$gdpsId);

//addTP.php
User::Webhook($WHcontent, $TEXTadd.$title);

//editTP.php
User::Webhook($WHcontent, $TEXTedit.$gdpsId);

//gdps.php comment
User::Webhook($WHcomms, $GDPScomm1.$whereiz.$GDPScomm2.$text);

//texure.php comment
User::Webhook($WHcomms, $TEXTcomm1.$whereiz.$TEXTcomm2.$text);

//Guide comment
User::Webhook($WHcomms, $GUIDcomm1.$whereiz.$GUIDcomm2.$text);

//list/search.php
User::Webhook($WHsearch, $GDPStags.$_GET['tags']);
User::Webhook($WHsearch, $GDPStags.$_GET['os']);
User::Webhook($WHsearch, $GDPSlike);
User::Webhook($WHsearch, $GDPSdisl);

//textures/search.php
User::Webhook($WHsearch, $TEXTtags.$_GET['tags']);
User::Webhook($WHsearch, $TEXTtags.$_GET['os']);
User::Webhook($WHsearch, $TEXTlike);
User::Webhook($WHsearch, $TEXTdisl);

//list/name.php
User::Webhook($WHsearch, $GDPSname.$_GET['framelabel']);

//textures/name.php
User::Webhook($WHsearch, $TEXTname.$_GET['framelabel']);

//tools

//setWeekly.php
User::Webhook($WHcontent, $GDPSweek.$_POST['id']);

//GDPSes.php
User::Webhook($WHadmin, $GDPSban.$_GET['id']);
User::Webhook($WHadmin, $GDPSunban.$_GET['id']);
User::Webhook($WHadmin, $GDPSdelete.$_GET['id']);

//Texures.php
User::Webhook($WHadmin, $TEXTban.$_GET['id']);
User::Webhook($WHadmin, $TEXTunban.$_GET['id']);
User::Webhook($WHadmin, $TEXTdelete.$_GET['id']);

//userManagement.php
User::Webhook($WHadmin, $USERrole1.$_POST['user'].$USERrole2.$_POST['role']);
*/