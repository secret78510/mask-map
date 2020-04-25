const data = [];//存放API用的
let search = document.querySelector('#search');//搜尋區域
let searchLabel = document.querySelector('.navSide-input label');//label 圖標裡面的icon
let county = document.querySelector('#county');//縣市選單
let town = document.querySelector('#town');//城鎮選單
//取得API
(function XML() {
    let xhr = new XMLHttpRequest();
    xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
    xhr.send();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let json = JSON.parse(xhr.response)
            //將值記錄在data陣列裡
            json.features.forEach(item => data.push(item))
            //過濾縣市名子
            let countyFilter = [];
            data.forEach(item => {
                if (countyFilter.indexOf(item.properties.county) === -1) {
                    countyFilter.push(item.properties.county)
                }
            })
            //將縣市名字有空白的清掉
            countyFilter.find((item, index) => {
                if (item == '') {
                    return countyFilter.splice(index, 1)
                }
            })
            //執行縣市選單 
            updateCounty(countyFilter)
            //回傳 符合縣市名字的 城鎮 ;
            let townFilter = [];
            data.filter(item => {                      //選的裡面第一個option的值
                if (item.properties.county.match(county.children[0].value)) {
                    return townFilter.push(item.properties.town)
                }
            })
            //將重複的值 消除 然後加入到town select
            let townSet = new Set(townFilter);
            //預設值
            updatePharmacy(county.value);
            updateTown(townSet);
            day();
            //讀取完成後取消loader
            document.querySelector('.loader').style.display ='none';
        }
    }
}())
//監聽
search.addEventListener('keypress', searchCounty);
searchLabel.addEventListener('click', searchCounty);
county.addEventListener('change', countySelect);
town.addEventListener('change', townSelect);
//navSide-header
function day() {
    let time = new Date();
    //顯示標題星期
    let day = time.getDay();
    let week = dayChinese(day);
    let today = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDay();
    document.querySelector('.navSide-header h2').textContent = `星期${week}`;
    document.querySelector('.navSide-header p').textContent = today;
    //顯示身分證末碼可用
    if (day === 1 || day === 3 || day === 5) {
        document.querySelector('.odd').style.display = 'block';
    } else if (day === 2 || day === 4 || day === 6) {
        document.querySelector('.even').style.display = 'block';
    } else {
        document.querySelector('.all').style.display = 'block';
    }
}

//將星期切換成中文
function dayChinese(day) {
    switch (day) {
        case 1:
            return '一'
        case 2:
            return '二'
        case 3:
            return '三'
        case 4:
            return '四'
        case 5:
            return '五'
        case 6:
            return '六'
        case 0:
            return '日'
        default:
            console.log('錯誤')
            break
    }
}
//隱藏navSide
function hide() {
    document.querySelector('.navSide').classList.toggle('hide');
    document.querySelector('.mapClass').classList.toggle('zoom');
    document.querySelector('.navSide-icon').classList.toggle('reduce');
}
//input searchIcon
function searchCounty() {
    event.preventDefault;
    //值等於input裡面的value
    let searchTxt = search.value;
    //空白就提醒 有值就回傳
    if (searchTxt === '') {
        return alert('請輸入內容')
    } else {
        //回收地圖游標
        mapMarker.remove()
        //更新navSide-body
        return updatePharmacy(searchTxt)
    }
}
//county select 
function countySelect() {
    let townFilter = [];
    data.forEach(item => {
        if (item.properties.county.match(county.value)) {
            return townFilter.push(item.properties.town)
        }
    })
    //將重複的值 消除 然後加入到town select
    let townSet = new Set(townFilter);
    mapMarker.remove()
    updateTown(townSet)
    updatePharmacy(county.value)
}
//town select 
function townSelect() {
    mapMarker.remove()
    updatePharmacy(town.value)
}
//navSide-body 藥局畫面
function updatePharmacy(county) {

    //過濾 沒有使用城鎮 就回傳城市
    const countyName = data.filter(item => {
        if (item.properties.town == county) {
            return item.properties.town == county
        } else {
            return item.properties.county == county
        }
    })
    //顯示藥局畫面
    let str = '';
    countyName.forEach(item => {
        //賦值解構 將檔案拆小
        const { properties, geometry } = item;
        //將MAP座標位子加入及字串
        mapMarker.add(geometry.coordinates[0], geometry.coordinates[1], properties)

        //口罩數量按鈕顏色
        const adultColor = (() => {
            if (properties.mask_adult === 0) {
                return '#34495e';
            } else if (properties.mask_adult < 100) {
                return '#e74c3c';
            } else {
                return '#3498db';
            }
        })()
        const childColor = (() => {
            if (properties.mask_child === 0) {
                return '#34495e';
            } else if (properties.mask_child < 100) {
                return '#e74c3c';
            } else {
                return '#3498db';
            }
        })()
        str += `<div class="navSide-item">
        <h4>${properties.name}</h4>
        <p>${properties.address}</p>
        <p>${properties.phone}</p>
        <p class="note">${properties.note}</p>
        <button class="adult" style="background-color:${adultColor}">
        ${properties.mask_adult}</button>
        <button class="child" style="background-color:${childColor}">
        ${properties.mask_child}</button>
        </div>`
    })
    document.querySelector('.navSide-body').innerHTML = str;

}

//seclect county選單 畫面
function updateCounty(countyName) {
    let str = '';
    for (let i = 0; i < countyName.length; i++) {
        str += `<option value="${countyName[i]}">${countyName[i]}</option>`
    }
    county.innerHTML = str
}
// 區域選單 畫面
function updateTown(townName) {
    let str = '';
    townName.forEach(item =>
        str += `<option value="${item}">${item}</option>`
    )
    town.innerHTML = str;
}


//地圖
//建立地圖
var map = L.map('map').setView([25.066954, 121.495889], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//地圖的icon內容
const iconsConfig = {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}
//將多個顏色Icon統一管理
const iconColor = {
    green: new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        ...iconsConfig,
    }),
    blue: new L.Icon({
        iconUrl:
            'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    }),
    gray: new L.Icon({
        iconUrl:
            'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    })
}
//新增游標以及回收游標
const mapMarker = {
    add(x, y, item) {
        const icon = item.mask_adult || item.mask_child ? iconColor.blue : iconColor.gray
        L.marker([y, x], {
            icon
        })
            .addTo(map)
            .bindPopup(`<strong>${item.name}</strong><br>
        <span>口罩剩餘:</span><strong>成人 - ${item.mask_adult ? `${item.mask_adult}個` : `未取得資料`}
        /兒童 - ${item.mask_child ? `${item.mask_child}個` : '未取得資料'}</strong><br>
        <span>地址:</span><a href="https://www.google.com.tw/maps/place/${item.address}" target=_blank>${item.address}</a><br>
        <span>電話:</span>${item.phone}<br>
        <small>最後更新時間${item.updated}</small>`)
            .openPopup();
    },
    remove() {
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        })
    }
}






