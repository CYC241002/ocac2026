(function() {
    fetch('./js/data.json').then(response => response.json()).then( jsonData => {
        var elementNavSessionRoot = document.getElementById('navSessionRoot');
        var elementSessionRoot = document.getElementById('sessionRoot');

        var dates = jsonData.dates;
        var schedule = jsonData.schedule;
        var gallery = jsonData.gallery;

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

                            var accordionBodyContent = '';

                            if (allDayandNightActivities.length > 0) {
                                accordionBodyContent += `<h3>全日活動</h3>`;
                                allDayandNightActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                            } else if (allDayActivities.length > 0) {
                                accordionBodyContent += `<h3>全日活動</h3>`;
                                allDayActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                                accordionBodyContent += `<h3>晚間活動</h3>`;
                                eveningActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                            } else {
                                accordionBodyContent += `<h3>上午活動</h3>`;
                                morningActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                                accordionBodyContent += `<h3>中午活動</h3>`;
                                afternoonActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                                accordionBodyContent += `<h3>晚間活動</h3>`;
                                eveningActivities.forEach(activity => accordionBodyContent += generateScheduleActivity(activity));
                            }

                            accordionBodyContent += `<h3 class="mt-2">住宿</h3>`;
                            accommodationInfo.forEach(activity => {
                                if (activity.introduction_en != '') {
                                    accordionBodyContent += `<p><a class="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" href="${activity.introduction_en}" target="_blank">${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></a></p>`
                                } else {
                                    accordionBodyContent += `<p>${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></p>`
                                }
                            });

                            var elementScheduleItem = `
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}" aria-expanded="false" aria-controls="session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}">
                                        ${toChineseDate(daily)} （${toChineseDate(daily, true)}）<small class="ps-2 text-secondary">${toEnglishDate(daily)}  ${toEnglishDate(daily, true)}</small>
                                    </button>
                                </h2>
                                <div id="session${date.session.toString().padStart(2, '0')}ScheduleDay${index + 1}" class="accordion-collapse collapse" data-bs-parent="session${date.session.toString().padStart(2, '0')}ScheduleAccordion">
                                    <div class="accordion-body">
                                        ${accordionBodyContent}
                                    </div>
                                </div>
                            </div>`

                            elementSessionArticleScheduleTable.insertAdjacentHTML('beforeend', elementScheduleItem);
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
                        <div class="col-6">
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

                // var tempPhotoGallery = `
                // <div class="container">
                //     <div class="row">
                //         <div class="col-6">
                //             <div class="card mb-2" style="width: 100%;">
                //                 <img class="card-img-top session-pic-card-img" src="img/session01/pictures/IMG_20250117_090427.jpg" class="img-fluid rounded">
                //                 <div class="card-body">
                //                     <h3 class="card-title">國立故宮博物院<br><small class="text-secondary">National Palace Museum</small></h3>
                //                 </div>
                //             </div>
                //         </div>
                //         <div class="col-6">
                //             <div class="card mb-2" style="width: 100%;">
                //                 <img class="card-img-top session-pic-card-img" src="img/session01/pictures/IMG_20250129_150736.jpg" class="img-fluid rounded">
                //                 <div class="card-body">
                //                     <h3 class="card-title">台北市<br><small class="text-secondary">Taipei City</small></h3>
                //                 </div>
                //             </div>
                //         </div>
                //     </div>
                // </div>`;

                // elementSessionArticlePhoto.insertAdjacentHTML('beforeend', tempPhotoGallery);
                elementSessionPhotoGallery.append(elementSessionPhotoGalleryRow);
                elementSessionArticlePhoto.append(elementSessionPhotoGallery);
                elementSessionArticle.append(elementSessionArticlePhoto);

                elementSessionRoot.append(elementSessionArticle);
            });
        }
    }).then(() => {
        var preloader = document.querySelector('.preloader');
        preloader.style.display = 'none';
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
        var accordionBodyContent = '';
        if (activity.title && activity.title !== '') {
            accordionBodyContent += `<h4>${activity.title}</h4>`
        }

        accordionBodyContent += `<p>${activity.place}<small class="ps-2 text-secondary">${activity.place_en}</small></p>`

        if (activity.introduction && activity.introduction !== '') {
            var intro_en = activity.introduction_en == '' ? `<small class="ps-2 text-secondary">${activity.introduction_en}</small>` : '';

            accordionBodyContent += `<p>${activity.introduction}${intro_en}</p>`
        }

        return accordionBodyContent;
    }
})()