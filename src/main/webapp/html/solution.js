let countOfRecords = 0;
let recordsOnPage = 3;
let pageNumber = 0;
const raceOptions = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const professionOptions = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const bannedOptions = [false, true];

$(document).ready(function () {
    getRecordsCount();
    handleSelectorOptions();
    getRecords();
    prepareRaceList();
    prepareProfessionList();
    prepareBannedList();
    addNewUserActions();
});

function getRecordsCount() {
    $.get('http://localhost:8090/rest/players/count', function (data) {
        countOfRecords = data;
        updatePaginationButtons();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error request:', errorThrown);
    });
}

function getRecords() {
    $.get(`http://localhost:8090/rest/players?pageSize=${recordsOnPage}&pageNumber=${pageNumber}`, function (data) {
        fillTable(data);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error request:', errorThrown);
    });
}

function deleteRecord(id) {
    $.ajax({
        url: `http://localhost:8090/rest/players/${id}`,
        type: 'DELETE',
        success: function () {
            getRecords();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error request:', errorThrown);
        }
    });
}

function saveUpdatedRecord(id, updatedUserData) {
    $.ajax({
        url: `http://localhost:8090/rest/players/${id}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updatedUserData),
        success: function () {
            getRecords();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error request:', errorThrown);
        }
    });
}

function addRecord(updatedUserData) {
    $.ajax({
        url: `http://localhost:8090/rest/players`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updatedUserData),
        success: function () {
            getRecords();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error request:', errorThrown);
        }
    });
}

function updatePaginationButtons() {
    const optionSelector = document.querySelector('.records-on-page');
    recordsOnPage = optionSelector.value;
    let buttonsCount = Math.ceil(countOfRecords / recordsOnPage);
    let buttonsRow = '';
    for (let i = 1; i <= buttonsCount; i++) {
        buttonsRow += `<button class="pagination-btn" value="${i}">${i}</button>`
    }
    let recordsCounter = document.querySelector('.pagination-buttons');
    recordsCounter.innerHTML = '';
    recordsCounter.insertAdjacentHTML("beforeend", buttonsRow);
    markActivePage(recordsCounter);
}

function handleSelectorOptions() {
    const optionSelector = document.querySelector('.records-on-page');
    optionSelector.addEventListener("change", function () {
        updatePaginationButtons();
        getRecords();
    });
}

function fillTable(data) {
    let newRow = '';
    data.forEach(record => {
        newRow +=
            `<tr>
                         <td>${record.id}</td>
                         <td class="name" id=${record.id}>${record.name}</td>
                         <td class="title" id=${record.id}>${record.title}</td>
                         <td class="race" id=${record.id}>${record.race}</td>
                         <td class="profession" id=${record.id}>${record.profession}</td>
                         <td>${record.level}</td>
                         <td>${formatDate(record.birthday)}</td>
                         <td class="banned" id=${record.id}>${record.banned}</td>
                         <td><img class="edit" id=${record.id} src="/img/edit.png" alt="Edit"></td>
                         <td><img class="delete" id=${record.id} src="/img/delete.png" alt="Delete"></td>
                    </tr>`;
    })

    let tableBody = document.querySelector('.players-list');
    tableBody.innerHTML = '';
    tableBody.insertAdjacentHTML("beforeend", newRow);

    handleDeleteActions();
    handleEditBtnClick();
}

function handleEditBtnClick() {
    const editButtons = document.querySelectorAll('.edit');
    editButtons.forEach(editButton => {
        editButton.addEventListener("click", function () {
            let deleteBtn = document.querySelector(`.delete[id="${editButton.id}"]`);
            deleteBtn.remove();
            openEditMode(editButton);
        });
    });
}

function openEditMode(editButton) {
    let saveBtn = document.createElement('img');
    saveBtn.src = '/img/save.png';
    saveBtn.id = editButton.id;
    editButton.replaceWith(saveBtn);
    let titleRecord = document.querySelector(`.title[id="${editButton.id}"]`);
    let nameRecord = document.querySelector(`.name[id="${editButton.id}"]`);
    let raceRecord = document.querySelector(`.race[id="${editButton.id}"]`);
    let professionRecord = document.querySelector(`.profession[id="${editButton.id}"]`);
    let bannedRecord = document.querySelector(`.banned[id="${editButton.id}"]`);

    let nameRow = document.createElement('input');
    nameRow.value = nameRecord.textContent;
    nameRecord.innerText = '';
    nameRecord.appendChild(nameRow);

    let titleRow = document.createElement('input');
    titleRow.value = titleRecord.textContent;
    titleRecord.innerText = '';
    titleRecord.appendChild(titleRow);

    let raceDD = generateDDOptionsList(raceOptions, raceRecord.textContent, 'race');
    raceRecord.innerHTML = raceDD;

    let professionDD = generateDDOptionsList(professionOptions, professionRecord.textContent, 'profession');
    professionRecord.innerHTML = professionDD;

    const activeValue = (bannedRecord.textContent === "true") ? true : false;
    let bannedDD = generateDDOptionsList(bannedOptions, activeValue, 'ban');
    bannedRecord.innerHTML = bannedDD;

    saveBtn.addEventListener("click", function () {
        let updatedUserData = {
            'name': nameRow.value,
            'title': titleRow.value,
            'race': raceRecord.querySelector('select').value,
            'profession': professionRecord.querySelector('select').value,
            'banned': bannedRecord.querySelector('select').value,
        }
        saveUpdatedRecord(editButton.id, updatedUserData);
    });
}

function generateDDOptionsList(optionsList, selectedOption, ddName) {
    let ddOptions = `<select name="${ddName}">`;
    optionsList.forEach(option => {
        if (option === selectedOption) {
            ddOptions += `<option selected value="${option}">${option}</option>`;
        } else {
            ddOptions += `<option value="${option}">${option}</option>`;
        }
    })
    ddOptions += '</select>';
    return ddOptions;
}

function handleDeleteActions() {
    const deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener("click", function () {
            deleteRecord(deleteButton.id);
        });
    });
}

function markActivePage(recordsCounter) {
    const paginationButtons = recordsCounter.querySelectorAll('button');
    paginationButtons.forEach(button => {
        button.addEventListener("click", function () {
            pageNumber = button.value - 1;
            getRecords();
            paginationButtons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove("pressed");
                }
            });
            button.classList.add("pressed");
        });
    });
}

function formatDate(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function prepareRaceList() {
    let labelElement = document.querySelector('.raceDropdown');
    labelElement.innerHTML =  generateDDOptionsList(raceOptions, raceOptions[0], 'raceAdd');
}

function prepareProfessionList() {
    let labelElement = document.querySelector('.professionDropdown');
    labelElement.innerHTML =  generateDDOptionsList(professionOptions, professionOptions[0], 'professionAdd');
}

function prepareBannedList() {
    let labelElement = document.querySelector('.bannedDropdown');
    labelElement.innerHTML =  generateDDOptionsList(bannedOptions, bannedOptions[0], 'bannedAdd');
}

function addNewUserActions() {
    const saveButton = document.querySelector('.save');
    saveButton.addEventListener("click", function () {
        let userData = {
            'name': document.querySelector('.addName').value,
            'title': document.querySelector('.addTitle').value,
            'race': document.querySelector('.raceDropdown').querySelector('select').value,
            'profession': document.querySelector('.professionDropdown').querySelector('select').value,
            'birthday': new Date(document.querySelector('.addDate').value).getTime(),
            'banned': document.querySelector('.bannedDropdown').querySelector('select').value,
            'level': document.querySelector('.addLevel').value,
        }
        addRecord(userData);
    });
}
