const STORAGE_KEY="goalflow_complete_v1";

let data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{"saved":0,"target":14000000,"history":[]}');

const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const short=n=>n>=1000000?"Rp"+(n/1000000).toFixed(n%1000000?1:0)+"jt":n>=1000?"Rp"+Math.round(n/1000)+"rb":money(n);

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render();}

function transaction(type){
    const input=document.getElementById(type==="income"?"addInput":"subtractInput");
    const description=document.getElementById(type==="income"?"addDescription":"subtractDescription");
    const amount=Number(input.value);
    const text=description.value.trim();

    if(!amount||amount<=0){
        alert("Masukkan nominal terlebih dahulu.");
        return;
    }

    if(!text){
        alert("Masukkan deskripsi transaksi.");
        description.focus();
        return;
    }

    if(type==="expense"&&amount>data.saved){
        alert("Pengeluaran tidak boleh lebih besar dari tabungan saat ini.");
        return;
    }

    data.saved+=type==="income"?amount:-amount;

    data.history.unshift({
        id:Date.now(),
        type,
        amount,
        description:text,
        date:new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})
    });

    input.value="";
    description.value="";
    save();
}

function setTarget(){
    const input=document.getElementById("targetInput");
    const value=Number(input.value);

    if(!value||value<=0){
        alert("Masukkan target yang valid.");
        return;
    }

    data.target=value;
    input.value="";
    save();
}

function resetAll(){
    if(!confirm("Yakin ingin menghapus semua progress dan riwayat?")) return;
    data={saved:0,target:14000000,history:[]};
    save();
}

function clearHistory(){
    if(!data.history.length)return;
    if(!confirm("Hapus semua riwayat transaksi?"))return;
    data.history=[];
    save();
}

function render(){
    const percent=Math.min(100,data.target?data.saved/data.target*100:0);
    const remaining=Math.max(0,data.target-data.saved);

    document.documentElement.style.setProperty("--progress",percent+"%");

    document.getElementById("percentage").innerHTML=percent.toFixed(1).replace(".0","")+"%";
    document.getElementById("percentageText").textContent=percent.toFixed(1).replace(".0","")+"%";
    document.getElementById("savedAmount").textContent=money(data.saved);
    document.getElementById("targetAmount").textContent="/ "+money(data.target);
    document.getElementById("remainingAmount").textContent=remaining?money(remaining)+" lagi":"TARGET TERCAPAI";
    document.getElementById("progressFill").style.width=percent+"%";
    document.getElementById("savedShort").textContent=short(data.saved);
    document.getElementById("targetShort").textContent=short(data.target);
    document.getElementById("remainingShort").textContent=short(remaining);

    renderHistory();
}

function renderHistory(){
    const body=document.getElementById("historyBody");
    const empty=document.getElementById("emptyHistory");

    let income=0;
    let expense=0;

    data.history.forEach(item=>{
        if(item.type==="income")income+=item.amount;
        else expense+=item.amount;
    });

    document.getElementById("totalIncome").textContent=money(income);
    document.getElementById("totalExpense").textContent=money(expense);

    body.innerHTML="";

    empty.style.display=data.history.length?"none":"block";

    data.history.forEach(item=>{
        const row=document.createElement("tr");

        const type=document.createElement("td");
        type.className="type "+(item.type==="income"?"green":"red");
        type.textContent=item.type==="income"?"+ Pemasukan":"− Pengeluaran";

        const amount=document.createElement("td");
        amount.className=item.type==="income"?"green":"red";
        amount.textContent=(item.type==="income"?"+":"−")+" "+money(item.amount);

        const description=document.createElement("td");
        description.textContent=item.description;

        const date=document.createElement("td");
        date.textContent=item.date;

        row.append(type,amount,description,date);
        body.appendChild(row);
    });
}

function switchPage(page){
    document.querySelectorAll(".page").forEach(item=>item.classList.remove("active"));
    document.querySelectorAll(".nav-button").forEach(item=>item.classList.remove("active"));

    document.getElementById(page).classList.add("active");
    document.querySelector('[data-page="'+page+'"]').classList.add("active");

    window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("addButton").addEventListener("click",()=>transaction("income"));
document.getElementById("subtractButton").addEventListener("click",()=>transaction("expense"));
document.getElementById("targetButton").addEventListener("click",setTarget);
document.getElementById("resetButton").addEventListener("click",resetAll);
document.getElementById("clearHistoryButton").addEventListener("click",clearHistory);

document.querySelectorAll(".nav-button").forEach(button=>{
    button.addEventListener("click",()=>switchPage(button.dataset.page));
});

render();
