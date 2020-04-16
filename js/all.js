const data = [];//存放API用的
let search = document.querySelector('#search');//搜尋區域
let searchLabel = document.querySelector('.navSide-input label');//label 圖標裡面的icon
let city = document.querySelector('#city');
let area = document.querySelector('#area');
//取得API
(function XML() {
    let xhr = new XMLHttpRequest();
    xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
    xhr.send();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let json = JSON.parse(xhr.response)
            for (let i = 0; i < json.features.length; i++) {
                data.push(json.features[i])
            }
            pharmacyShow('苗栗縣');
            citySelect()
        }
    }
}())
//監聽
search.addEventListener('keypress', searchCity);
searchLabel.addEventListener('click', searchCity);
city.addEventListener('change', searchCity);
area.addEventListener('change', searchCity);

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
day()
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
}

//navSide-body
function pharmacyShow(county) {
    const cityName = data.filter(item => {
        if (item.properties.town === county) {
           return item.properties.town === county
        } else {
          return  item.properties.county === county
        }
    })
    //顯示藥局畫面
    let str = '';
    cityName.forEach(item => {
        //賦值解構 將檔案拆小
        const { properties, geometry } = item;
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
//input
function searchCity(e) {
    event.preventDefault;
    //值等於input裡面的value
    let searchTxt = search.value;

    //input
    pharmacyShow(searchTxt);
    //select
    pharmacyShow(e.target.value)
    //更新area裡的值
    areaSelect()
}
//seclect
function citySelect() {
    //城市顯示
    const cityFilter = [];
    //過濾重複城市名稱 沒有這個城市名稱就加入
    data.filter(item => {
        if (cityFilter.indexOf(item.properties.county) === -1) {
            cityFilter.push(item.properties.county)
        }
    })
    //把內容用option 然後加入到select
    for (let i = 0; i < cityFilter.length; i++) {
        let option = document.createElement('option');
        option.textContent = cityFilter[i];
        city.appendChild(option);
    }

    areaSelect()
}
function areaSelect(){
    //區域顯示
    //當每次city換城市 就把area清空 才能把值帶進去
    
    while (area.hasChildNodes()) {
        area.removeChild(area.firstChild);
      }
    let areaFilter = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].properties.county === city.value) {
            areaFilter.push(data[i].properties.town)
        }
    }
    //將重複的值 消除 然後加入到area select
    let areaSet = new Set(areaFilter);
    for(let value of areaSet.values()){
        let option = document.createElement('option');
        option.textContent = value;
        area.appendChild(option);
    }
    
}