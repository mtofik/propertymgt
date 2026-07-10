document.addEventListener("DOMContentLoaded", function () {

    // Rewrite fetch calls targeting old backend port to the running backend port.
    (function() {
        const OLD = 'http://localhost:3000';
        const NEW = 'http://localhost:3002';
        const originalFetch = window.fetch.bind(window);
        window.fetch = function(input, init) {
            try {
                if (typeof input === 'string') {
                    if (input.startsWith(OLD)) input = input.replace(OLD, NEW);
                } else if (input && input.url && typeof input.url === 'string') {
                    if (input.url.startsWith(OLD)) {
                        input = new Request(input.url.replace(OLD, NEW), input);
                    }
                }
            } catch (e) {
                // fallback to original input on error
            }
            return originalFetch(input, init);
        };
    })();

    const message1 = document.getElementById('messageDisplay1');
    const message2 = document.getElementById('messageDisplay2');
    const view = document.getElementById('viewResults');
    const searchInput = document.getElementById('searchInput');

    function showMessage(el, text) {
        el.innerHTML = text;
        el.classList.remove('d-none');
    }

    function clearView() {
        view.innerHTML = '';
        message1.classList.add('d-none');
        message2.classList.add('d-none');
        searchInput.value = '';
    }

    function fetchData(url, x) {
        fetch(url)
            .then((data) => data.json())
            .then((response) => {
                if (response) {
                    const r = Array.isArray(response) ? response : [response];
                    let count = 0;
                    r.forEach(a => {
                        count += a.stock;
                    });
                    document.getElementById(x).innerHTML = count;
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    if (document.body.classList.contains('indexMain')) {
        fetchData('http://localhost:3000/unit/browse', 'totalUnitsCount');
        fetchData('http://localhost:3000/unit/appartment', 'appartmentUnitsCount');
        fetchData('http://localhost:3000/unit/villa', 'villaUnitsCount');
        fetchData('http://localhost:3000/unit/penthouse', 'penthouseUnitsCount');
    };

    if (document.body.classList.contains('blockBody')) {

        const myTable = "block";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function fetchBlockData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Block Name</th>
                                <th>Area</th>
                                <th>Owner</th>
                                <th>Block</th>
                                <th>Floor Height</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th>${a.id}</th>
                                <td>${a.name}</td>
                                <td>${a.size}</td>
                                <td>${a.owner}</td>
                                <td>${a.block}</td>
                                <td>${a.floor_height}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.id}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="7" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.id}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.id));
                    });
                    showMessage(message2, `Found ${arr.length} blocks`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchBlockData(`http://localhost:3000/select/${myTable}`, "All Blocks");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchBlockData(`http://localhost:3000/select/${myTable}?name=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", async () => {
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new block</h6>
                    <form id="addForm">
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Parcel No.</label>
                            <input type="text" class="form-control" id="nameInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Area</label>
                            <input type="number" class="form-control" id="areaInput1" name="area1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Owner</label>
                            <input type="text" class="form-control" id="ownerInput1" name="owner1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="block1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Floor Height</label>
                        <select class="form-select mb-3" id="heightInput1" name="height1" required aria-label="Default select example">
                            <option selected>Please select floor height here</option>
                            <option value="G+1">G+1</option>
                            <option value="G+2">G+2</option>
                            <option value="G+3">G+3</option>
                        </select>
                        <button type="submit" class="btn btn-primary">ADD</button>
                    </form>
                `;
            const blocks = await api('select');
            document.getElementById('blockInput1').innerHTML =
                `<option value="">Select block</option>` +
                [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');

            document.getElementById('addForm').onsubmit = async e => {
                e.preventDefault();
                const data = {
                    name: nameInput1.value, owner: ownerInput1.value, size: areaInput1.value,
                    block: blockInput1.value, floor_height: heightInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                e.target.reset();
            }
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove block</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Block</label>
                    <select class="form-select mb-3" id="blockInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('blockInput1').innerHTML =
                blocks.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${blockInput1.value}/id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?id=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit block</h6>
                    <form id="editForm">
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Parcel No.</label>
                            <input type="text" class="form-control" id="nameInput1" name="name1"
                                aria-describedby="emailHelp" value='${b.name}' required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Area</label>
                            <input type="number" class="form-control" id="areaInput1" name="area1"
                                aria-describedby="emailHelp" value='${b.size}' required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Owner</label>
                            <input type="text" class="form-control" id="ownerInput1" name="owner1"
                                aria-describedby="emailHelp" value='${b.owner}' required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="block1" required aria-label="Default select example">
                            <option selected>${b.block}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Floor Height</label>
                        <select class="form-select mb-3" id="heightInput1" name="height1" required aria-label="Default select example">
                            <option selected>${b.floor_height}</option>
                            <option value="G+1">G+1</option>
                            <option value="G+2">G+2</option>
                            <option value="G+3">G+3</option>
                        </select>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const data = {
                    id,
                    data: {
                        name: nameInput1.value, owner: ownerInput1.value, size: areaInput1.value,
                        block: blockInput1.value, floor_height: heightInput1.value
                    }
                };
                try { await api(`update/id`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('statusBody')) {

        const myTable = "status";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchStatusData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Contractor</th>
                                <th scope="col">Description of work done</th>
                                <th scope="col">Non active reason</th>
                                <th scope="col">Date</th>
                                <th scope="col">Current status</th>
                                <th scope="col">Active</th>
                                <th scope="col">View image</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${a.status_id}</th>
                                <td>${a.block_id}</td>
                                <td>${a.contractor}</td>
                                <td>${a.description_of_work_done}</td>
                                <td>${a.non_active_reason}</td>
                                <td>${a.last_work_date ? a.last_work_date.split('T')[0] : ''}</td>
                                <td>${a.current_status}</td>
                                <td>${a.is_active}</td>
                                <td>${a.image_url}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.status_id}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="10" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.status_id}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.status_id));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchStatusData(`http://localhost:3000/select/${myTable}`, "All Status");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchStatusData(`http://localhost:3000/select/${myTable}?block_id=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new status</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Furat">Furat</option>
                            <option value="Debeb">Debebe</option>
                            <option value="Mishcon">Mishcon</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" checked>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0">
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="GF slab">GF slaab</option>
                            <option value="FF column cast">FF column cast</option>
                            <option value="Roof">Roof</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Payment">Payment</option>
                            <option value="Material">Material</option>
                            <option value="Excavator">Excavator</option>
                            <option value="Rain">Rain</option>
                        </select>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="image" accept="image/*" required>
                        </div>
                        <p id="status"></p>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('uploadImage', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?status_id=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit status</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="categoryInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" value='${b.last_work_date ? b.last_work_date.split('T')[0] : ''}' class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.contractor}</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" ${b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0" ${!b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.description_of_work_done}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.non_active_reason}</option>
                        </select>
                        <div class="col-sm-12 col-xl-6">
                            <div class="bg-secondary rounded h-100 p-4">
                                <h6 class="mb-4">${b.image_url}</h6>
                                <img class="img-fluid mx-auto mb-4" src='..${b.image_url}' style="width: 500px; height: 500px;">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="img1" required>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('uploadImage', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                const data = {
                    id,
                    data: {
                        block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                        is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                        non_active_reason: reasonInput1.value, image_url: re.filePath
                    }
                };
                try { await api(`update/status_id`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('customerBody')) {

        const myTable = "customer";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchCustomerData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Customer Name</th>
                                <th scope="col">Block No</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Address</th>
                                <th scope="col">Representative</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Address</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${a.custId}</th>
                                <td>${a.customerName}</td>
                                <td>${a.blockId}</td>
                                <td>${a.phone}</td>
                                <td>${a.city}/${a.subcity}/${a.woreda}/${a.houseNo}</td>
                                <td>${a.repName}</td>
                                <td>${a.repPhone}</td>
                                <td>${a.repCity}/${a.repSubcity}/${a.repWoreda}/${a.repHouseNo}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.custId}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="9" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.custId}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.custId));
                    });
                    showMessage(message2, `Found ${arr.length} customers`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchCustomerData(`http://localhost:3000/select/${myTable}`, "All customers");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchCustomerData(`http://localhost:3000/select/${myTable}?customerName=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new customer</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Customer Name</label>
                            <input type="text" class="form-control" id="custNameInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Phone</label>
                            <input type="text" class="form-control" id="phoneInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">City</label>
                        <select class="form-select mb-3" id="cityInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select city here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">SubCity</label>
                        <select class="form-select mb-3" id="subcityInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select subcity here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Woreda</label>
                        <select class="form-select mb-3" id="woredaInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select woreda here</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">House No.</label>
                            <input type="text" class="form-control" id="houseNoInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Representative Name</label>
                            <input type="text" class="form-control" id="repNameInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Phone</label>
                            <input type="text" class="form-control" id="repPhoneInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">City</label>
                        <select class="form-select mb-3" id="repCityInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select city here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">SubCity</label>
                        <select class="form-select mb-3" id="repSubcityInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select subcity here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Woreda</label>
                        <select class="form-select mb-3" id="repWoredaInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select woreda here</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">House No.</label>
                            <input type="text" class="form-control" id="repHouseNoInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;

            const city = [
                "Addis Ababa", "Bahirdar", "Dire Dawa", "Hawasa", "Welkite", "Butajira", "Arbaminch",
                "Gambela", "Asosa", "Afar", "Adama", "Jimma", "Ambo", "Shashemene", "Sheger", "Jijiga", "Harer"];
            const subcity = [
                "Addis ketema", "Akaki kality", "Arada", "Bole", "Gullelle", "Kirkos", "Kolfe keranio",
                "Koye fiche", "Lideta", "Nefas silk Laphto", "Yeka"];
            const woreda = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
            
            const cityOptions = `<option value="">Select city here</option>` +
                city.map(b => `<option value="${b}">${b}</option>`).join('');
            const subcityOptions = `<option value="">Select subcity here</option>` +
                subcity.map(b => `<option value="${b}">${b}</option>`).join('');
            const woredaOptions = `<option value="">Select woreda here</option>` +
                woreda.map(b => `<option value="${b}">${b}</option>`).join('');

            document.getElementById('cityInput1').innerHTML = cityOptions;
            document.getElementById('repCityInput1').innerHTML = cityOptions;
            document.getElementById('subcityInput1').innerHTML = subcityOptions;
            document.getElementById('repSubcityInput1').innerHTML = subcityOptions;
            document.getElementById('woredaInput1').innerHTML = woredaOptions;
            document.getElementById('repWoredaInput1').innerHTML = woredaOptions;

            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }
                            fetch(`http://localhost:3000/select/block?block=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const data = {
                    customerName: custNameInput1.value, blockId: parcelInput1.value, phone: phoneInput1.value,
                    city: cityInput1.value, subcity: subcityInput1.value, woreda: woredaInput1.value,
                    houseNo: houseNoInput1.value, repName: repNameInput1.value, repPhone: repPhoneInput1.value,
                    repCity: repCityInput1.value, repSubcity: repSubcityInput1.value, repWoreda: repWoredaInput1.value, repHouseNo: repHouseNoInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove customer</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Customer ID</label>
                    <select class="form-select mb-3" id="custIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('custIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.custId}">${b.custId}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${custIdInput1.value}/custId`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?custId=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit customers</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="categoryInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.blockId}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.blockId}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Customer Name</label>
                            <input type="text" value="${b.customerName}" class="form-control" id="custNameInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Phone</label>
                            <input type="text" value="${b.phone}" class="form-control" id="phoneInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">City</label>
                        <select class="form-select mb-3" id="cityInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.city}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">SubCity</label>
                        <select class="form-select mb-3" id="subcityInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.subcity}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Woreda</label>
                        <select class="form-select mb-3" id="woredaInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.woreda}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">House No.</label>
                            <input type="text" value="${b.houseNo}" class="form-control" id="houseNoInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Representative Name</label>
                            <input type="text" value="${b.repName}" class="form-control" id="repNameInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Phone</label>
                            <input type="text" value="${b.repPhone}" class="form-control" id="repPhoneInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">City</label>
                        <select class="form-select mb-3" id="repCityInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.repCity}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">SubCity</label>
                        <select class="form-select mb-3" id="repSubcityInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.repSubcity}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Woreda</label>
                        <select class="form-select mb-3" id="repWoredaInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.repWoreda}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">House No.</label>
                            <input type="text" value="${b.repHouseNo}" class="form-control" id="repHouseNoInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const data = {
                    id,
                    data: {
                        customerName: custNameInput1.value, blockId: parcelInput1.value, phone: phoneInput1.value,
                        city: cityInput1.value, subcity: subcityInput1.value, woreda: woredaInput1.value,
                        houseNo: houseNoInput1.value, repName: repNameInput1.value, repPhone: repPhoneInput1.value,
                        repCity: repCityInput1.value, repSubcity: repSubcityInput1.value, repWoreda: repWoredaInput1.value, repHouseNo: repHouseNoInput1.value
                    }
                };
                try { await api(`update/custId`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('leaseBody')) {

        const myTable = "lease";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchLeaseData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let count = 1;
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Customer Name</th>
                                <th scope="col">Invoice No</th>
                                <th scope="col">Area</th>
                                <th scope="col">Lease per m2</th>
                                <th scope="col">Penalty</th>
                                <th scope="col">Interest</th>
                                <th scope="col">Roof & wall</th>
                                <th scope="col">Total</th>
                                <th scope="col">Paid</th>
                                <th scope="col">Remaining</th>
                                <th scope="col">Note</th>
                                <th scope="col">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${count++}</th>
                                <td>${a.blockId}</td>
                                <td>${a.custName}</td>
                                <td>${a.invoiceNo}</td>
                                <td>${a.size}</td>
                                <td>${a.leasePricePerm2}</td>
                                <td>${a.penality}</td>
                                <td>${a.interest}</td>
                                <td>${a.roofnwall}</td>
                                <td>${a.total}</td>
                                <td>${a.paid}</td>
                                <td>${a.remaining}</td>
                                <td>${a.note}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.blockId}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="14" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.blockId}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.blockId));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchLeaseData(`http://localhost:3000/selectLease/${myTable}`, "All Lease");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchLeaseData(`http://localhost:3000/selectLease/${myTable}?blockId=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/uploadLease/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { 
                    showMessage(message1, 'Error uploading!');
                }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new lease year</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Year</label>
                        <select class="form-select mb-3" id="yearInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select year here</option>
                            <option>2017</option>
                            <option>2018</option>
                            <option>2019</option>
                            <option>2020</option>
                            <option>2021</option>
                            <option>2022</option>
                            <option>2023</option>
                            <option>2024</option>
                            <option>2025</option>
                            <option>2026</option>
                            <option>2027</option>
                            <option>2028</option>
                        </select>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api2(`select/${myTable}?blockId=${id}`);
            const total = b.total;
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit lease</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.blockId}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Invoice No</label>
                            <input type="text" value='${b.invoiceNo}' class="form-control" id="invoiceInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Lease Price Per m2</label>
                            <input type="number" value='${b.leasePricePerm2? b.leasePricePerm2 : 0.00}' class="form-control" id="leasePerm2Input1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Penality</label>
                            <input type="number" value='${b.penality? b.penality : 0.00}' class="form-control" id="penaltyInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Interest</label>
                            <input type="number" value='${b.interest? b.interest : 0.00}' class="form-control" id="interestInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Roof and Wall</label>
                            <input type="number" value='${b.roofnwall? b.roofnwall : 0.00}' class="form-control" id="roofnwallInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Total</label>
                            <input type="number" value='${b.total? b.total : 0.00}' class="form-control" id="totalInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Paid</label>
                            <input type="number" value='${b.paid? b.paid : 0.00}' class="form-control" id="paidInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Remaining</label>
                            <input type="number" value='${b.total-b.paid}' class="form-control" id="remainInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Note Reminder</label>
                        <div class="form-floating">
                            <textarea class="form-control" value='${b.note}'
                                id="noteInput1" style="height: 150px;"></textarea>
                            <label for="floatingTextarea">Comments</label>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const data = {
                    id,
                    data: {
                        blockId: parcelInput1.value, invoiceNo: invoiceInput1.value, leasePricePerm2: leasePerm2Input1.value,
                        penality: penaltyInput1.value, interest: interestInput1.value, roofnwall: roofnwallInput1.value,
                        total: totalInput1.value, note: noteInput1.value, paid: paidInput1.value, remaining: remainInput1.value
                    }
                };
                try { await api(`update/blockId`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('aggreementBody')) {

        const myTable = "agreement";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchLeaseData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let count = 1;
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Customer Name</th>
                                <th scope="col">Invoice No</th>
                                <th scope="col">Area</th>
                                <th scope="col">Lease per m2</th>
                                <th scope="col">Penalty</th>
                                <th scope="col">Interest</th>
                                <th scope="col">Roof & wall</th>
                                <th scope="col">Total</th>
                                <th scope="col">Paid</th>
                                <th scope="col">Remaining</th>
                                <th scope="col">Note</th>
                                <th scope="col">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${count++}</th>
                                <td>${a.blockId}</td>
                                <td>${a.custName}</td>
                                <td>${a.invoiceNo}</td>
                                <td>${a.size}</td>
                                <td>${a.leasePricePerm2}</td>
                                <td>${a.penality}</td>
                                <td>${a.interest}</td>
                                <td>${a.roofnwall}</td>
                                <td>${a.total}</td>
                                <td>${a.paid}</td>
                                <td>${a.remaining}</td>
                                <td>${a.note}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.blockId}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="14" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.blockId}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.blockId));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchLeaseData(`http://localhost:3000/selectLease/${myTable}`, "All Lease");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchLeaseData(`http://localhost:3000/selectLease/${myTable}?blockId=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/uploadLease/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { 
                    showMessage(message1, 'Error uploading!');
                }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new status</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Furat">Furat</option>
                            <option value="Debeb">Debebe</option>
                            <option value="Mishcon">Mishcon</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" checked>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0">
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="GF slab">GF slaab</option>
                            <option value="FF column cast">FF column cast</option>
                            <option value="Roof">Roof</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Payment">Payment</option>
                            <option value="Material">Material</option>
                            <option value="Excavator">Excavator</option>
                            <option value="Rain">Rain</option>
                        </select>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="image" accept="image/*" required>
                        </div>
                        <p id="status"></p>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                console.log(formData);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api2(`select/${myTable}?blockId=${id}`);
            const total = b.total;
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit lease</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.blockId}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Invoice No</label>
                            <input type="text" value='${b.invoiceNo}' class="form-control" id="invoiceInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Lease Price Per m2</label>
                            <input type="number" value='${b.leasePricePerm2? b.leasePricePerm2 : 0.00}' class="form-control" id="leasePerm2Input1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Penality</label>
                            <input type="number" value='${b.penality? b.penality : 0.00}' class="form-control" id="penaltyInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Interest</label>
                            <input type="number" value='${b.interest? b.interest : 0.00}' class="form-control" id="interestInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Roof and Wall</label>
                            <input type="number" value='${b.roofnwall? b.roofnwall : 0.00}' class="form-control" id="roofnwallInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Total</label>
                            <input type="number" value='${b.total? b.total : 0.00}' class="form-control" id="totalInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Paid</label>
                            <input type="number" value='${b.paid? b.paid : 0.00}' class="form-control" id="paidInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Remaining</label>
                            <input type="number" value='${b.total-b.paid}' class="form-control" id="remainInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Note Reminder</label>
                        <div class="form-floating">
                            <textarea class="form-control" value='${b.note}'
                                id="noteInput1" style="height: 150px;"></textarea>
                            <label for="floatingTextarea">Comments</label>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const data = {
                    id,
                    data: {
                        blockId: parcelInput1.value, invoiceNo: invoiceInput1.value, leasePricePerm2: leasePerm2Input1.value,
                        penality: penaltyInput1.value, interest: interestInput1.value, roofnwall: roofnwallInput1.value,
                        total: totalInput1.value, note: noteInput1.value, paid: paidInput1.value, remaining: remainInput1.value
                    }
                };
                try { await api(`update/blockId`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('custBalanceBody')) {

        const myTable = "status";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchStatusData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Contractor</th>
                                <th scope="col">Description of work done</th>
                                <th scope="col">Non active reason</th>
                                <th scope="col">Date</th>
                                <th scope="col">Current status</th>
                                <th scope="col">Active</th>
                                <th scope="col">View image</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${a.status_id}</th>
                                <td>${a.block_id}</td>
                                <td>${a.contractor}</td>
                                <td>${a.description_of_work_done}</td>
                                <td>${a.non_active_reason}</td>
                                <td>${a.last_work_date ? a.last_work_date.split('T')[0] : ''}</td>
                                <td>${a.current_status}</td>
                                <td>${a.is_active}</td>
                                <td>${a.image_url}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.status_id}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="7" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.status_id}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.status_id));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchStatusData(`http://localhost:3000/select/${myTable}`, "All Status");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchStatusData(`http://localhost:3000/select/${myTable}?block_id=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new status</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Furat">Furat</option>
                            <option value="Debeb">Debebe</option>
                            <option value="Mishcon">Mishcon</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" checked>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0">
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="GF slab">GF slaab</option>
                            <option value="FF column cast">FF column cast</option>
                            <option value="Roof">Roof</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Payment">Payment</option>
                            <option value="Material">Material</option>
                            <option value="Excavator">Excavator</option>
                            <option value="Rain">Rain</option>
                        </select>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="image" accept="image/*" required>
                        </div>
                        <p id="status"></p>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                console.log(formData);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?status_id=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit status</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="categoryInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" value='${b.last_work_date ? b.last_work_date.split('T')[0] : ''}' class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.contractor}</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" ${b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0" ${!b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.description_of_work_done}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.non_active_reason}</option>
                        </select>
                        <div class="col-sm-12 col-xl-6">
                            <div class="bg-secondary rounded h-100 p-4">
                                <h6 class="mb-4">Image</h6>
                                <img class="img-fluid mx-auto mb-4" src='..${b.image_url}' style="width: 500px; height: 500px;">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="img1" required>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                const data = {
                    id,
                    data: {
                        block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                        is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                        non_active_reason: reasonInput1.value, image_url: re.filePath
                    }
                };
                try { await api(`update/status_id`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('materialBody')) {

        const myTable = "status";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchStatusData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Contractor</th>
                                <th scope="col">Description of work done</th>
                                <th scope="col">Non active reason</th>
                                <th scope="col">Date</th>
                                <th scope="col">Current status</th>
                                <th scope="col">Active</th>
                                <th scope="col">View image</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${a.status_id}</th>
                                <td>${a.block_id}</td>
                                <td>${a.contractor}</td>
                                <td>${a.description_of_work_done}</td>
                                <td>${a.non_active_reason}</td>
                                <td>${a.last_work_date ? a.last_work_date.split('T')[0] : ''}</td>
                                <td>${a.current_status}</td>
                                <td>${a.is_active}</td>
                                <td>${a.image_url}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.status_id}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="7" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.status_id}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.status_id));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchStatusData(`http://localhost:3000/select/${myTable}`, "All Status");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchStatusData(`http://localhost:3000/select/${myTable}?block_id=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new status</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Furat">Furat</option>
                            <option value="Debeb">Debebe</option>
                            <option value="Mishcon">Mishcon</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" checked>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0">
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="GF slab">GF slaab</option>
                            <option value="FF column cast">FF column cast</option>
                            <option value="Roof">Roof</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Payment">Payment</option>
                            <option value="Material">Material</option>
                            <option value="Excavator">Excavator</option>
                            <option value="Rain">Rain</option>
                        </select>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="image" accept="image/*" required>
                        </div>
                        <p id="status"></p>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                console.log(formData);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?status_id=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit status</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="categoryInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" value='${b.last_work_date ? b.last_work_date.split('T')[0] : ''}' class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.contractor}</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" ${b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0" ${!b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.description_of_work_done}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.non_active_reason}</option>
                        </select>
                        <div class="col-sm-12 col-xl-6">
                            <div class="bg-secondary rounded h-100 p-4">
                                <h6 class="mb-4">Image</h6>
                                <img class="img-fluid mx-auto mb-4" src='..${b.image_url}' style="width: 500px; height: 500px;">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="img1" required>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                const data = {
                    id,
                    data: {
                        block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                        is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                        non_active_reason: reasonInput1.value, image_url: re.filePath
                    }
                };
                try { await api(`update/status_id`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

    if (document.body.classList.contains('laborBody')) {}

    if (document.body.classList.contains('salesBody')) {}

    if (document.body.classList.contains('bankBody')) {}

    if (document.body.classList.contains('checkStubsBody')) {}

    if (document.body.classList.contains('nameChangeBody')) {}

    if (document.body.classList.contains('kartaBody')) {

        const myTable = "status";

        function api(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}/${myTable}`, {
                method,
                headers: { 'content-type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            }).then(r => r.json())
        }

        function api2(path, method = 'get', body) {
            return fetch(`http://localhost:3000/${path}`, {
                method,
                body: body
            }).then(r => r.json())
        }

        function fetchStatusData(url, title) {
            message1.classList.add('d-none');
            message2.classList.add('d-none');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const arr = Array.isArray(data) ? data : [data];
                    let html = `
                    <br><h6 class="mb-4">${title}</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Block Name</th>
                                <th scope="col">Contractor</th>
                                <th scope="col">Description of work done</th>
                                <th scope="col">Non active reason</th>
                                <th scope="col">Date</th>
                                <th scope="col">Current status</th>
                                <th scope="col">Active</th>
                                <th scope="col">View image</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length ? arr.map(a => `
                            <tr>
                                <th scope="row">${a.status_id}</th>
                                <td>${a.block_id}</td>
                                <td>${a.contractor}</td>
                                <td>${a.description_of_work_done}</td>
                                <td>${a.non_active_reason}</td>
                                <td>${a.last_work_date ? a.last_work_date.split('T')[0] : ''}</td>
                                <td>${a.current_status}</td>
                                <td>${a.is_active}</td>
                                <td>${a.image_url}</td>
                                <td>
                                    <button class="btn btn-primary" id="editBtn${a.status_id}"><i class="fa fa-edit me-2"></i></button>
                                </td>
                            </tr>
                            `).join('') :
                            `<tr>
                                <td colspan="7" class="text-center">No records found</td>
                            </tr>`
                        }
                        </tbody>
                    </table>`;

                    view.innerHTML = html;
                    arr.forEach(a => {
                        const btn = document.getElementById(`editBtn${a.status_id}`);
                        if (btn) btn.addEventListener("click", () => showEdit(a.status_id));
                    });
                    showMessage(message2, `Found ${arr.length} status`);
                })
                .catch(err => {
                    console.error(err);
                    showMessage(message1, "Error fetching!");
                });
        }

        document.getElementById("browseAllBtn").addEventListener("click", () => {
            clearView();
            fetchStatusData(`http://localhost:3000/select/${myTable}`, "All Status");
        });

        document.getElementById("searchForm").addEventListener("submit", e => {
            e.preventDefault();
            fetchStatusData(`http://localhost:3000/select/${myTable}?block_id=${encodeURIComponent(searchInput.value)}`, "Search Results");
        });

        document.getElementById("uploadBtn").addEventListener("click", () => {
            clearView();
            view.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Upload file</label>
                <input class="form-control bg-dark" type="file" id="upload" accept=".xlsx,.xls"><br>
                <button class="btn btn-primary" id="uploadFileButton">Upload</button>
            </div>`;

            document.getElementById('uploadFileButton').onclick = async () => {
                const fileInput = document.getElementById('upload').files[0];
                if (!fileInput)
                    return alert("Please select a file first.");

                const formData = new FormData();
                formData.append("excel", fileInput);
                try {
                    await fetch(`http://localhost:3000/upload/${myTable}`, { method: 'post', body: formData });
                    showMessage(message2, 'Successfully uploaded!');
                } catch { showMessage(message1, 'Error uploading!'); }
            }

        });

        document.getElementById("newBtn").addEventListener("click", (e) => {
            e.preventDefault();
            clearView();

            view.innerHTML = `
                    <h6 class="mb-4">Add new status</h6>
                    <form id="addForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="blockInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block here</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select block first</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Furat">Furat</option>
                            <option value="Debeb">Debebe</option>
                            <option value="Mishcon">Mishcon</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" checked>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0">
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="GF slab">GF slaab</option>
                            <option value="FF column cast">FF column cast</option>
                            <option value="Roof">Roof</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>Please select catergory here</option>
                            <option value="Payment">Payment</option>
                            <option value="Material">Material</option>
                            <option value="Excavator">Excavator</option>
                            <option value="Rain">Rain</option>
                        </select>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="image" accept="image/*" required>
                        </div>
                        <p id="status"></p>
                        <button type="submit" class="btn btn-primary">ADD</button><br><br>
                    </form>
                `;
            //const blocks = await api('select');
            fetch(`http://localhost:3000/select/block`)
                .then(r => r.json()
                    .then((blocks) => {
                        document.getElementById('blockInput1').innerHTML =
                            `<option value="">Select block</option>` +
                            [...new Set(blocks.map(b => b.block))].map(b => `<option>${b}</option>`).join('');
                        const blockSelect = document.getElementById('blockInput1');
                        blockSelect.addEventListener('change', () => {
                            const blockSelected = blockSelect.value;

                            if (!blockSelected) {
                                document.getElementById('parcelInput1').innerHTML = `<option value="">Select block first</option>`;
                                return;
                            }

                            fetch(`http://localhost:3000/select/block?name=${encodeURIComponent(blockSelected)}`)
                                .then(r => r.json())
                                .then(parcels => {
                                    document.getElementById('parcelInput1').innerHTML =
                                        `<option value="">Select parcel</option>` +
                                        [...new Set(parcels.map(d => d.name))]
                                            .map(d => `<option value="${d}">${d}</option>`)
                                            .join('');
                                })
                                .catch(err => console.error("Error loading parcels:", err));
                        });
                    })
                )

            document.getElementById('addForm').addEventListener("submit", async (e) => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                //
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                if (!file) return alert("Please select an image!");

                const formData = new FormData();
                formData.append("image", file);
                console.log(formData);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                // try{fetch("http://localhost:3000/upload", {
                //     method: "POST",
                //     body: formData
                // })
                // .then((res) = res.json())
                // .then((result) => {
                //     document.getElementById("status").innerText = result.message;
                //     re=result;
                //     alert(result);
                // })}
                // catch{
                //     console.log("error");
                // }

                const data = {
                    block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                    is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                    non_active_reason: reasonInput1.value, image_url: re.filePath, last_work_date: DateInput1.value
                };
                try { await api('insert', 'post', data); showMessage(message2, 'Added!'); }
                catch { showMessage(message1, 'Error adding!'); }
                //e.target.reset();
            })
        });

        document.getElementById("deleteBtn").addEventListener("click", async () => {
            clearView();
            view.innerHTML = `
                <h6 class="mb-4">Remove status</h6>
                <form id="deleteForm">
                    <label for="exampleInputEmail1" class="form-label">Status ID</label>
                    <select class="form-select mb-3" id="statusIdInput1" name="id" required aria-label="Default select example">
                        <option selected>Please select block here</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Remove</button>
                </form>
            `;

            const blocks = await api('select');
            document.getElementById('statusIdInput1').innerHTML =
                blocks.map(b => `<option value="${b.status_id}">${b.status_id}</option>`).join('');
            document.getElementById('deleteForm').onsubmit = async e => {
                e.preventDefault();
                try { await api(`delete/${statusIdInput1.value}/status_id`, 'delete'); showMessage(message2, 'Deleted!'); clearView(); }
                catch { showMessage(message1, 'Error deleting!'); }
            };
        });

        async function showEdit(id) {
            clearView();
            const [b] = await api(`select/${myTable}?status_id=${id}`);
            view.innerHTML = `
                    <h6 class="mb-4">View and Edit status</h6>
                    <form id="editForm">
                        <label for="exampleInputEmail1" class="form-label">Block</label>
                        <select class="form-select mb-3" id="categoryInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Parcel</label>
                        <select class="form-select mb-3" id="parcelInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.block_id}</option>
                        </select>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Date</label>
                            <input type="date" value='${b.last_work_date ? b.last_work_date.split('T')[0] : ''}' class="form-control" id="DateInput1" name="name1"
                                aria-describedby="emailHelp" required>
                            <div id="emailHelp" class="form-text"></div>
                        </div>
                        <label for="exampleInputEmail1" class="form-label">Contractor</label>
                        <select class="form-select mb-3" id="contractorInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.contractor}</option>
                        </select>
                        <fieldset class="row mb-3">
                            <legend class="col-form-label col-sm-2 pt-0">Status</legend>
                            <div class="col-sm-10">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios1" value="1" ${b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios1">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="gridRadios"
                                        id="gridRadios2" value="0" ${!b.is_active ? 'checked' : ''}>
                                    <label class="form-check-label" for="gridRadios2">Non active</label>
                                </div>
                            </div>
                        </fieldset>
                        <label for="exampleInputEmail1" class="form-label">Work done</label>
                        <select class="form-select mb-3" id="statusInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.description_of_work_done}</option>
                        </select>
                        <label for="exampleInputEmail1" class="form-label">Non Active Reason</label>
                        <select class="form-select mb-3" id="reasonInput1" name="category1" required aria-label="Default select example">
                            <option selected>${b.non_active_reason}</option>
                        </select>
                        <div class="col-sm-12 col-xl-6">
                            <div class="bg-secondary rounded h-100 p-4">
                                <h6 class="mb-4">Image</h6>
                                <img class="img-fluid mx-auto mb-4" src='..${b.image_url}' style="width: 500px; height: 500px;">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Upload image</label>
                            <input class="form-control bg-dark" type="file" id="imgInput1" name="img1" required>
                        </div><br>
                        <button type="submit" class="btn btn-primary">Save</button><br><br>
                    </form>
                `;
            document.getElementById('editForm').onsubmit = async e => {
                e.preventDefault();
                const selected = document.querySelector('input[name="gridRadios"]:checked');
                const fileInput = document.getElementById("imgInput1");
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append("image", file);
                let re;
                try { re = await api2('upload', 'post', formData); }
                catch { showMessage(message1, 'Error adding!'); }
                const data = {
                    id,
                    data: {
                        block_id: parcelInput1.value, last_work_date: DateInput1.value, contractor: contractorInput1.value,
                        is_active: selected.value, description_of_work_done: statusInput1.value, current_status: statusInput1.value,
                        non_active_reason: reasonInput1.value, image_url: re.filePath
                    }
                };
                try { await api(`update/status_id`, 'put', data); showMessage(message2, 'Updated!'); clearView(); }
                catch { showMessage(message1, 'Error updating!'); }
            }
        }

    };

});