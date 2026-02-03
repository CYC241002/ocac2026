(function() {
    const user_lang = navigator.language || navigator.userLanguage;

    var elementNavSessionRoot = document.getElementById('navSessionRoot');
    var elementSessionRoot = document.getElementById('sessionRoot');
    var elementNewsRoot = document.getElementById('news');
    var elementPlaceModal = document.getElementById('placeModal');
    const modalPlace = bootstrap.Modal.getOrCreateInstance(elementPlaceModal) || new bootstrap.Modal(elementPlaceModal);

    var placeData = null;
    
    Promise.all([
        fetch('./js/data.json').then(response => response.json()),
        fetch('./js/place.json').then(response => response.json()).then(data => { placeData = data; })
    ])
    .then( ([jsonData]) => {
        const HEADER_SESSION_NAME = 'header';

        var dates = jsonData.dates;
        var schedule = jsonData.schedule;
        var gallery = jsonData.gallery;
        var news = jsonData.news;

        if (news && news[HEADER_SESSION_NAME]) {
            var newsHTML = '<h2>最新消息</h2><div class="accordion accordion-flush border border-1 mb-4">';
            news[HEADER_SESSION_NAME].forEach((item, index) => {
                var link = item.link && item.link !== '' ? `<p><a class="btn btn-outline-primary mt-2 mb-2" href="${item.link}" target="_blank">詳細資訊</a></p>` : '';
                var image = item.image && item.image !== '' ? `<img src="img/${HEADER_SESSION_NAME}/pictures/${item.image}" class="img-fluid rounded mt-2 mb-2 mx-auto d-block" alt="${item.title}">` : '' ;
                var mark = '';
                if (item.importance && item.importance.toUpperCase() === 'IMPORTANT') {
                    mark = '<i class="bi bi-exclamation-diamond pe-1 text-danger fw-bold"></i>';
                } else if (item.importance && item.importance.toUpperCase() === 'WARN') {
                    mark = '<i class="bi bi-info-circle pe-1 text-warning fw-bold"></i>';
                }
                var newsItem = `
                <div id="HeaderNews${index}" class="accordion-item">
                    <h3 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#HeaderNewsCollapse${index}" aria-expanded="false" aria-controls="HeaderNewsCollapse${index}">
                            ${mark}${item.title}
                        </button>
                    </h3>
                    <div id="HeaderNewsCollapse${index}" class="accordion-collapse collapse" data-bs-parent="#newsAccordion">
                        <div class="accordion-body">
                            <div>${item.content}</div>
                            ${image}
                            ${link}
                        </div>
                    </div>
                </div>`

                newsHTML += newsItem;
            });

            newsHTML += '</div>';
            elementNewsRoot.innerHTML = newsHTML;
        }

        if (dates && dates.length > 0) {
            dates.forEach(date => {
                if (date.status && date.status.toUpperCase() === 'CANCELLED') {
                    elementNavSessionRoot.insertAdjacentHTML('beforeend', `<li class="nav-item"><a class="nav-link" href="#session${date.session.toString().padStart(2, '0')}" role="button">第${toChineseNum(date.session)}梯次</a></li>`)

                    var elementSessionArticle = document.createElement('article');
                    elementSessionArticle.id = 'session' + date.session.toString().padStart(2, '0');
                    elementSessionArticle.className = 'session-section container mt-5 mb-5';
                    var infoText = `
                    <hgroup>
                        <h1>第${toChineseNum(date.session)}梯次：${date.area}</h1>
                        <p class="mb-0">${toOrdinal(date.session, true)} Session: ${date.area_en}</p>
                        <p>${toChineseDate(date.start_date)}至${toChineseDate(date.end_date)}</p>
                    </hgroup>
                    <div class="container mb-4">
                        <h2 id="session${date.session.toString().padStart(2, '0')}Info">舉辦資訊</h2>
                        <ul>
                            <li>報名日期：${toChineseDate(date.register_date)}至${toChineseDate(date.expiration_date)}</li>
                            <li>招收名額：${date.quota}名</li>
                        </ul>
                        <div class="p-3 mt-2 mb-2 text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded-3">
                            <p class="m-0 p-0">本梯次已取消</p>
                        </div>
                    </div>
                    `

                    elementSessionArticle.insertAdjacentHTML('beforeend', infoText);
                    elementSessionRoot.append(elementSessionArticle);
                    return; // skip cancelled sessions
                }
                
                elementNavSessionRoot.insertAdjacentHTML('beforeend', `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">第${toChineseNum(date.session)}梯次</a><ul class="dropdown-menu"><li><a href="#session${date.session.toString().padStart(2, '0')}Info" class="dropdown-item">舉辦資訊</a></li><li><a href="#session${date.session.toString().padStart(2, '0')}Schedule" class="dropdown-item">行程表</a></li><li><a href="#session${date.session.toString().padStart(2, '0')}Photo" class="dropdown-item">花絮</a></li></ul></li>`)

                var elementSessionArticle = document.createElement('article');
                elementSessionArticle.id = 'session' + date.session.toString().padStart(2, '0');
                elementSessionArticle.className = 'session-section container mt-5 mb-5';
                var infoText = `
                <hgroup>
                    <h1>第${toChineseNum(date.session)}梯次：${date.area}</h1>
                    <p class="mb-0">${toOrdinal(date.session, true)} Session: ${date.area_en}</p>
                    <p>${toChineseDate(date.start_date)}至${toChineseDate(date.end_date)}</p>
                </hgroup>
                <div class="container mb-4">
                    <h2 id="session${date.session.toString().padStart(2, '0')}Info">舉辦資訊</h2>
                    <ul>
                        <li>報名日期：${toChineseDate(date.register_date)}至${toChineseDate(date.expiration_date)}</li>
                        <li>招收名額：${date.quota}名</li>
                    </ul>
                    <div class="w-100 d-flex justify-content-center">
                        <a class="btn btn-primary btn-lg mt-2 mb-2" href="${date.link}" target="_blank">招生簡章看這裡！</a>
                    </div>
                </div>
                `

                if (date.status.toUpperCase() === 'ENDED') {
                    infoText += `<div class="p-3 mt-2 mb-2 text-info-emphasis bg-info-subtle border border-info-subtle rounded-3">
                        <p class="m-0 p-0">本梯次已成功結束，感謝各位學員參與。</p>
                    </div>`;
                }

                if (news[date.session]) {
                    var newsHTML = '<h3>最新消息</h3><div class="accordion accordion-flush border border-1 mb-4">';
                    news[date.session].forEach((item, index) => {
                        var link = item.link && item.link !== '' ? `<p><a class="btn btn-outline-primary mt-2 mb-2" href="${item.link}" target="_blank">詳細資訊</a></p>` : '';
                        var image = item.image && item.image !== '' ? `<img src="img/${date.session.toString().padStart(2, '0')}/pictures/${item.image}" class="img-fluid rounded mt-2 mb-2 mx-auto d-block" alt="${item.title}">` : '';
                        var mark = '';
                        if (item.importance && item.importance.toUpperCase() === 'IMPORTANT') {
                            mark = '<i class="bi bi-exclamation-diamond pe-1 text-danger fw-bold"></i>';
                        } else if (item.importance && item.importance.toUpperCase() === 'WARN') {
                            mark = '<i class="bi bi-info-circle pe-1 text-warning fw-bold"></i>';
                        }
                        var newsItem = `
                        <div id="HeaderNews${date.session}x${index}" class="accordion-item">
                            <h4 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#HeaderNewsCollapse${index}" aria-expanded="false" aria-controls="HeaderNewsCollapse${index}">
                                    ${mark}${item.title}
                                </button>
                            </h4>
                            <div id="HeaderNewsCollapse${index}" class="accordion-collapse collapse" data-bs-parent="#newsAccordion">
                                <div class="accordion-body">
                                    <div>${item.content}</div>
                                    ${image}
                                    ${link}
                                </div>
                            </div>
                        </div>`

                        newsHTML += newsItem;
                    });

                    newsHTML += '</div>';
                    infoText += newsHTML;
                }

                elementSessionArticle.insertAdjacentHTML('beforeend', infoText);

                var elementSessionArticleSchedule = document.createElement('div');
                elementSessionArticleSchedule.id = 'session' + date.session.toString().padStart(2, '0') + 'Schedule';
                elementSessionArticleSchedule.className = 'mb-4';
                elementSessionArticleSchedule.insertAdjacentHTML('beforeend', `<h2>行程表</h2>
                <div class="p-3 mt-2 mb-2 text-warning-emphasis bg-warning-subtle border border-warning-subtle rounded-3">
                    <p class="m-0 p-0">◎本行程及內容，僑務委員會保留依實際執行情形調整之權利。</p>
                </div>`);
                var elementSessionArticleScheduleTable = document.createElement('div');
                elementSessionArticleScheduleTable.id = `session${date.session.toString().padStart(2, '0')}ScheduleAccordion`;
                elementSessionArticleScheduleTable.className = 'accordion accordion-flush border border-1';
                
                if (schedule && schedule[date.session]) {
                    var scheduleList = Object.groupBy(schedule[date.session], s => s.date);
                    if (scheduleList) {
                        Object.entries(scheduleList).forEach(([daily, schedules], index) => {
                            
                            var dailySchedule = Object.groupBy(schedules, s => s.time)
                            var morningActivities = dailySchedule['morning'] || [];
                            var afternoonActivities = dailySchedule['afternoon'] || [];
                            var eveningActivities = dailySchedule['evening'] || [];
                            var allDayActivities = dailySchedule['all-day'] || [];
                            var allDayandNightActivities = dailySchedule['all-dayandnight'] || [];
                            var accommodationInfo = dailySchedule['accommodation'] || [];

                            var accordionBodyContent = document.createElement('div');
                            accordionBodyContent.className = 'accordion-body';

                            if (allDayandNightActivities.length > 0) {
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>全日活動</h3>`);
                                allDayandNightActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                            } else if (allDayActivities.length > 0) {
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>全日活動</h3>`);
                                allDayActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>晚間活動</h3>`);
                                eveningActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                            } else {
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>上午活動</h3>`);
                                morningActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>中午活動</h3>`);
                                afternoonActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                                accordionBodyContent.insertAdjacentHTML('beforeend', `<h3>晚間活動</h3>`);
                                eveningActivities.forEach(activity => accordionBodyContent.appendChild(generateScheduleActivity(activity)));
                            }

                            accordionBodyContent.insertAdjacentHTML('beforeend', `<h3 class="mt-2">住宿</h3>`);
                            accommodationInfo.forEach(activity => {
                                if (activity.introduction_en != '') {
                                    accordionBodyContent.insertAdjacentHTML('beforeend', `<p><a class="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0" href="${activity.introduction_en}" target="_blank">${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></a></p>`)
                                } else {
                                    accordionBodyContent.insertAdjacentHTML('beforeend', `<p>${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></p>`)
                                }
                            });

                            var elementScheduleItem = document.createElement('div');
                            elementScheduleItem.innerHTML = `
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}" aria-expanded="false" aria-controls="session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}">
                                        ${toChineseDate(daily)} （${toChineseDate(daily, true)}）<small class="ps-2 text-secondary">${toEnglishDate(daily)}  ${toEnglishDate(daily, true)}</small>
                                    </button>
                                </h2>
                            </div>`;
                            elementScheduleItem = elementScheduleItem.firstElementChild;

                            var elementScheduleItemBodyOuter = document.createElement('div');
                            elementScheduleItemBodyOuter.innerHTML = `<div id="session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}" class="accordion-collapse collapse" data-bs-parent="session${date.session.toString().padStart(2, '0')}ScheduleAccordion">
                            </div>`;
                            elementScheduleItemBodyOuter = elementScheduleItemBodyOuter.firstElementChild;
                            elementScheduleItemBodyOuter.appendChild(accordionBodyContent);
                            
                            elementScheduleItem.appendChild(elementScheduleItemBodyOuter);
                            elementSessionArticleScheduleTable.appendChild(elementScheduleItem);
                        })
                    }
                }
                
                elementSessionArticleSchedule.append(elementSessionArticleScheduleTable);
                elementSessionArticle.append(elementSessionArticleSchedule);

                var elementSessionArticlePhoto = document.createElement('div');
                elementSessionArticlePhoto.id = 'session' + date.session.toString().padStart(2, '0') + 'Photo';
                elementSessionArticlePhoto.className = 'mb-4';
                elementSessionArticlePhoto.insertAdjacentHTML('beforeend', `<h2>花絮</h2>`);

                var elementSessionPhotoGallery = document.createElement('div');
                elementSessionPhotoGallery.className = 'container';
                var elementSessionPhotoGalleryRow = document.createElement('div');
                elementSessionPhotoGalleryRow.className = 'row';

                if (gallery && gallery[date.session]) {
                    gallery[date.session].forEach(photo => {
                        var photoCard = `
                        <div class="col-12 col-md-6">
                            <div class="card mb-2" style="width: 100%;">
                                <img class="card-img-top session-pic-card-img" src="img/session${date.session.toString().padStart(2, '0')}/pictures/${photo.fileName}" class="img-fluid rounded">
                                <div class="card-body">
                                    <h3 class="card-title">${photo.description}<br><small class="text-secondary">${photo.description_en}</small></h3>
                                </div>
                            </div>
                        </div>`;

                        elementSessionPhotoGalleryRow.insertAdjacentHTML('beforeend', photoCard);
                    })
                }

                elementSessionPhotoGallery.append(elementSessionPhotoGalleryRow);
                elementSessionArticlePhoto.append(elementSessionPhotoGallery);
                elementSessionArticle.append(elementSessionArticlePhoto);

                elementSessionRoot.append(elementSessionArticle);
            });
        }
    }).then(() => {
        var preloader = document.querySelector('.preloader');
        preloader.classList.add('fade-out');
        preloader.addEventListener('animationend', () => {
            preloader.style.display = 'none';
        });
    });

    function toChineseNum(number) {
        const map = {
            '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
            '6': '六', '7': '七', '8': '八', '9': '九'
        };

        // 使用 replace 搭配正規表達式 /[1-9]/g 進行全局替換
        return number.toString().replace(/[1-9]/g, s => map[s]);
    }

    function toOrdinal(n, ifHtml = false) {
        const num = parseInt(n);
        const s = ["th", "st", "nd", "rd"];
        const v = num % 100;
        // 邏輯：如果是 11-13 結尾用 th，否則取個位數對應的後綴
        if (ifHtml) {
            return num + '<sup>' + (s[(v - 20) % 10] || s[v] || s[0]) + '</sup>';
        } else {
            return num + (s[(v - 20) % 10] || s[v] || s[0]);
        }
    }

    function toChineseDate(dateVal, returnWeekday = false) {
        // 1. 如果是 "none" 或空值，直接回傳原文字
        if (!dateVal || dateVal === "none") return dateVal;

        // 2. 嘗試將字串轉為 Date 物件
        const d = new Date(dateVal);

        // 3. 檢查轉換是否成功 (避免 Invalid Date)
        if (isNaN(d.getTime())) return dateVal;

        // 4. 使用 Intl.DateTimeFormat 輸出中文格式
        // options 可以設定要不要補零，例如 day: 'numeric' (不補零) 或 '2-digit' (補零)
        if (!returnWeekday) {
            return new Intl.DateTimeFormat('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(d).replace(/\//g, '月').replace(/(\d{2})$/, '$1日').replace('月', '年').replace('日', '日');
        } else {
            return new Intl.DateTimeFormat('zh-TW', {
                weekday: 'long'
            }).format(d)
        }
        
        // 或是更直覺的手動拼接：
        // return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日`;
    }

    function toEnglishDate(dateVal, returnWeekday = false) {
        if (!dateVal || dateVal === "none") return dateVal;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        if (!returnWeekday) {
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            return `${year}/${month}/${day}`;
        } else {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long'
            }).format(d)
        }
    }

    function generateScheduleActivity(activity) {
        // var accordionBodyContent = '';
        // if (activity.title && activity.title !== '') {
        //     accordionBodyContent += `<h4>${activity.title}</h4>`
        // }

        // if (activity.place_id != '' && placeData && placeData.find(place => place.id === activity.place_id)) {
        //     accordionBodyContent += `<p><a href="#" onClick="event.preventDefault(); showPlaceModal(${activity.place_id}, '${activity.place}');">${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></a></p>`   
        // } else {
        //     accordionBodyContent += `<p>${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></p>`
        // }

        // if (activity.introduction && activity.introduction !== '') {
        //     var intro_en = activity.introduction_en == '' ? `<small class="ps-2 text-secondary">${activity.introduction_en}</small>` : '';

        //     accordionBodyContent += `<p>${activity.introduction}${intro_en}</p>`
        // }

        // return accordionBodyContent;

        var accordionBody = document.createElement('div');
        if (activity.title && activity.title !== '') {
            var titleElement = document.createElement('h4');
            titleElement.innerText = activity.title;
            accordionBody.appendChild(titleElement);
        }

        if (activity.place_id != '' && placeData && placeData.find(place => place.id === activity.place_id)) {
            var placeElement = document.createElement('a');
            placeElement.href = '#';
            placeElement.className = 'link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0';
            placeElement.innerHTML = `<p>${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></p>`;
            placeElement.addEventListener('click', function(e) {
                e.preventDefault();
                showPlaceModal(activity.place_id, activity.place);
            })
            accordionBody.appendChild(placeElement);
        } else {
            var placeElement = document.createElement('p');
            placeElement.innerHTML = `${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small>`;
            accordionBody.appendChild(placeElement);
        }

        if (activity.introduction && activity.introduction !== '') {
            var intro_en = activity.introduction_en == '' ? `<small class="ps-2 text-secondary">${activity.introduction_en}</small>` : '';
            var introElement = document.createElement('p');
            introElement.innerHTML = `${activity.introduction}${intro_en}`;
            accordionBody.appendChild(introElement);
        }

        return accordionBody;
    }

    function showPlaceModal(placeId, placeName) {
        console.log(placeName);
        if (!placeData) return;

        var placeInfo = placeData.find(place => place.id === placeId);
        if (!placeInfo) return;

        var elementPlaceModalTitle = elementPlaceModal.querySelector('.modal-title');
        var elementPlaceModalBody = elementPlaceModal.querySelector('.modal-body');

        var image = placeInfo.image && placeInfo.image !== '' ? `<img src="img/place/${placeInfo.image}" class="img-fluid rounded mb-3 mx-auto d-block" alt="${placeName}">` : '' ;

        elementPlaceModalTitle.innerHTML = placeName
        elementPlaceModalBody.innerHTML = (placeInfo[user_lang] || placeInfo["zh-TW"]).split('\n').filter(line => line.trim() !== '').map(line => `<p>${line}</p>`).join('') + image;

        modalPlace.show();
    }
})()