document.addEventListener("DOMContentLoaded", function(){
    
    function fetchData(url,x){
        fetch(url)
        .then((data)=> data.json())
        .then((response)=>{
            if(response){
                const r = Array.isArray(response) ? response : [response];
                let count=0;
                r.forEach(a=>{
                    count += a.stock;
                });
                document.getElementById(x).innerHTML = count;
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    };

    if(document.body.classList.contains('indexMain')){
        fetchData('http://localhost:3000/unit/browse','totalUnitsCount');
        fetchData('http://localhost:3000/unit/appartment','appartmentUnitsCount');
        fetchData('http://localhost:3000/unit/villa','villaUnitsCount');
        fetchData('http://localhost:3000/unit/penthouse','penthouseUnitsCount');
    };

    if(document.body.classList.contains('browseBody')){
        document.getElementById("browseAllBtn").addEventListener("click", ()=>{
            const message1 = document.getElementById('messageDisplay1');
            const message2 = document.getElementById('messageDisplay2');
            document.getElementById('searchInput').value="";
            fetch('http://localhost:3000/unit/browse')
            .then((data)=> data.json())
            .then((response)=>{
                if(response.ok){
                    message2.innerHTML='Found these units';
                    message2.classList.remove('d-none');
                }
                let html; 
                html = `
                    <br><br><h6 class="mb-4">All units</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Unit Name</th>
                                <th scope="col">Price</th>
                                <th scope="col">Amount available</th>
                                <th scope="col">Category</th>
                                <th scope="col">Date added</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                const r = Array.isArray(response) ? response : [response];
                r.forEach(a=>{
                    html += `
                        <tr>
                            <th scope="row">${a.id}</th>
                            <td>${a.name}</td>
                            <td>${a.price}</td>
                            <td>${a.stock}</td>
                            <td>${a.category}</td>
                            <td>${a.Added_at}</td>
                            <td>
                                <button type="button" class="btn btn-primary" style="padding-right:5px" id="viewUnitBtn${a.id}"><i class="fa fa-eye me-2"></i></button>
                                <button type="button" class="btn btn-primary" style="padding-right:5px" id="editUnitBtn${a.id}"><i class="fa fa-edit me-2"></i></button>
                                <button type="button" class="btn btn-primary" style="padding-right:5px" id="deleteUnitBtn${a.id}"><i class="fa fa-trash me-2"></i></button>
                            </td>
                        </tr>
                    `;
                });
                html += `
                    </tbody>
                </table>
                `;
                document.getElementById('viewResults').innerHTML = html;
                r.forEach((a) => {
                    document.getElementById(`viewUnitBtn${a.id}`).addEventListener("click", () => {
                        console.log("Viewing unit:", a);
                        // 👉 open modal or details page
                    });

                    document.getElementById(`editUnitBtn${a.id}`).addEventListener("click", () => {
                        document.getElementById('searchInput').value="";
                        let htm; 
                        htm = `
                            <h6 class="mb-4">Update unit</h6>
                            <form id="updateUnitForm">
                                <div class="mb-3">
                                    <label for="exampleInputEmail1" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="nameInput${a.id}" name="name3"
                                     value="${a.name}"   aria-describedby="emailHelp">
                                    <div id="emailHelp" class="form-text"></div>
                                </div>
                                <label for="exampleInputEmail1" class="form-label">Price</label>
                                <div class="input-group mb-3">
                                    <span class="input-group-text">$</span>
                                    <input type="text" class="form-control" id="priceInput${a.id}" value="${a.price}" name="price3" aria-label="Amount (to the nearest dollar)">
                                    <span class="input-group-text">.00</span>
                                </div>
                                <div class="mb-3">
                                    <label for="exampleInputEmail1" class="form-label">Stock</label>
                                    <input type="number" class="form-control" id="stockInput${a.id}" name="stock3"
                                        aria-describedby="emailHelp" value="${a.stock}">
                                    <div id="emailHelp" class="form-text"></div>
                                </div>
                                <label for="exampleInputEmail1" class="form-label">Category</label>
                                <select class="form-select mb-3" value="${a.category}" id="categoryInput${a.id}" name="category3" aria-label="Default select example">
                                    <option >Please select catergory here</option>
                                    <option value="Appartment">Appartment</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Penthouse">Penthouse</option>
                                </select>
                                <div class="mb-3">
                                    <label for="formFile" class="form-label">Change image</label>
                                    <input class="form-control bg-dark" type="file" value="${a.image}" id="imgInput${a.id}" name="img3">
                                </div>
                                <button type="submit" class="btn btn-primary">UPDATE</button>
                                <button type="button" id="closeBtn" class="btn btn-primary">CLOSE</button>
                            </form>
                        `;
                        document.getElementById('viewResults').innerHTML = htm;
                        document.getElementById('closeBtn').addEventListener("click", ()=>{
                            document.getElementById('viewResults').innerHTML = html;
                        })
                    });

                    document.getElementById(`deleteUnitBtn${a.id}`).addEventListener("click", () => {
                        console.log("Deleting unit:", a.id);
                        // 👉 call API to delete
                    });
                });
            })
            .catch((err)=>{
                console.log(err);
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
        });

        document.getElementById("searchForm").addEventListener("submit", (e)=>{
            e.preventDefault();

            const searchInput = document.getElementById('searchInput');
            const message1 = document.getElementById('messageDisplay1');
            const message2 = document.getElementById('messageDisplay2');
            fetch(`http://localhost:3000/unit/browse/${searchInput.value}`)
            .then((data)=> data.json())
            .then((response)=>{
                if(response){
                    message2.innerHTML='Found these units';
                    message2.classList.remove('d-none');
                }
                let html; 
                html = `
                    <br><br><h6 class="mb-4">All units</h6>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Unit Name</th>
                                <th scope="col">Price</th>
                                <th scope="col">Amount available</th>
                                <th scope="col">Category</th>
                                <th scope="col">Date added</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                const r = Array.isArray(response) ? response : [response];
                r.forEach(a=>{
                    html += `
                        <tr>
                            <th scope="row">${a.id}</th>
                            <td>${a.name}</td>
                            <td>${a.price}</td>
                            <td>${a.stock}</td>
                            <td>${a.category}</td>
                            <td>${a.Added_at}</td>
                            <td>view</td>
                        </tr>
                    `;
                });
                html += `
                    </tbody>
                </table>
                `;
                document.getElementById('viewResults').innerHTML = html;
            })
            .catch((err)=>{
                console.log(err);
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
        });
    };
    
    if(document.body.classList.contains('newBody')){
    document.getElementById("addUnitForm").addEventListener("submit", (e)=>{
        e.preventDefault();

        const name = document.getElementById('nameInput1');
        const price = document.getElementById('priceInput1');
        const stock = document.getElementById('stockInput1');
        const category = document.getElementById('categoryInput1');
        const image = document.getElementById('imgInput1');
        const message1 = document.getElementById('messageDisplay1');
        const message2 = document.getElementById('messageDisplay2');
        fetch('http://localhost:3000/unit/add', {
            method: "post",
            headers: {'content-type':'application/json'},
            body: JSON.stringify({
                name1: name.value,
                price1: price.value,
                stock1: stock.value,
                category1: category.value,
                img1: image.value,
            })
        })
        .then((response)=>{
            if(response.ok){
                message2.innerHTML='Successfully added!';
                message2.classList.remove('d-none');
            }
            return response.json();
        })
        .then(data => console.log(data))
        .catch((err)=>{
            message1.innerHTML='Error fetching!';
            message1.classList.remove('d-none');
        });
        document.getElementById("addUnitForm").reset();
        this.reset();
        e.reset();
    });
    };

    if(document.body.classList.contains('updateBody')){
        const id = document.getElementById('idInput1');
        const name = document.getElementById('nameInput1');
        const price = document.getElementById('priceInput1');
        const stock = document.getElementById('stockInput1');
        const category = document.getElementById('categoryInput1');
        const image = document.getElementById('imgInput1');
        
        document.getElementById("idInput1").addEventListener("focus", ()=>{
            const message1 = document.getElementById('messageDisplay1');
            //const message2 = document.getElementById('messageDisplay2');
            fetch('http://localhost:3000/unit/browse')
            .then((data)=> data.json())
            .then((response)=>{
                let html; 
                html = '<option value="">Please select unit here</option>';
                
                const r = Array.isArray(response) ? response : [response];
                r.forEach(a=>{
                    html += `<option value="${a.id}">${a.name}</option>`;
                });
                document.getElementById('idInput1').innerHTML = html;
            })
            .catch((err)=>{
                console.log(err);
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
        });

        document.getElementById("idInput1").addEventListener("change", (e)=>{
            const searchInput = e.target.value;
            if(!id) return;
            const message1 = document.getElementById('messageDisplay1');
            //const message2 = document.getElementById('messageDisplay2');
            fetch(`http://localhost:3000/unit/search/${searchInput}`)
            .then((data)=> data.json())
            .then((response)=>{
                const r = Array.isArray(response) ? response : [response];
                document.getElementById('nameInput1').value = r[0].name;
                document.getElementById('priceInput1').value = r[0].price;
                document.getElementById('stockInput1').value = r[0].stock;
                document.getElementById('categoryInput1').value = r[0].category;
            })
            .catch((err)=>{
                console.log(err);
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
        });

        document.getElementById("updateUnitForm").addEventListener("submit", (e)=>{
            e.preventDefault();
        
            const message1 = document.getElementById('messageDisplay1');
            const message2 = document.getElementById('messageDisplay2');
            fetch(`http://localhost:3000/unit/update/${id.value}`, {
                method: "put",
                headers: {'content-type':'application/json'},
                body: JSON.stringify({
                    name2: name.value,
                    price2: price.value,
                    stock2: stock.value,
                    category2: category.value,
                    img2: image.value,
                })
            })
            .then((response)=>{
                if(response.ok){
                    message2.innerHTML='Successfully updated!';
                    message2.classList.remove('d-none');
                    document.getElementById("updateUnitForm").reset();
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch((err)=>{
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
            document.getElementById("updateUnitForm").reset();
        });

    };

    if(document.body.classList.contains('deleteBody')){

        const id = document.getElementById('deleteIdInput');
        const message1 = document.getElementById('messageDisplay1');
        const message2 = document.getElementById('messageDisplay2');

        document.getElementById("deleteIdInput").addEventListener("focus", ()=>{
            fetch('http://localhost:3000/unit/browse')
            .then((data)=> data.json())
            .then((response)=>{
                let html; 
                html = '<option value="">Please select unit here</option>';
                
                const r = Array.isArray(response) ? response : [response];
                r.forEach(a=>{
                    html += `<option value="${a.id}">${a.name}</option>`;
                });
                document.getElementById('deleteIdInput').innerHTML = html;
            })
            .catch((err)=>{
                console.log(err);
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
        });

        document.getElementById("deleteUnitForm").addEventListener("submit", (e)=>{
            e.preventDefault();

            fetch(`http://localhost:3000/unit/delete/${id.value}`, {
                method: "delete",
                headers: {'content-type':'application/json'}
            })
            .then((response)=>{
                if(response.ok){
                    message2.innerHTML='Successfully deleted!';
                    message2.classList.remove('d-none');
                }
                return response.json();
            })
            .then(data => console.log(data))
            .catch((err)=>{
                message1.innerHTML='Error fetching!';
                message1.classList.remove('d-none');
            });
            document.getElementById("deleteUnitForm").reset();
        });
    };
    
});