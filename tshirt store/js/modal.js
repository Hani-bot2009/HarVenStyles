(function () {

  if (document.getElementById("hvModal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",

    `
    <div id="hvModal" class="hv-modal">

      <div class="hv-modal-box">

        <h3 class="hv-modal-title">
          HarVenStyles
        </h3>

        <p class="hv-modal-message"></p>

        <div class="hv-modal-buttons">

          <button id="hvCancelBtn">
            Cancel
          </button>

          <button id="hvOkBtn">
            OK
          </button>

        </div>

      </div>

    </div>
    `
  );

})();

window.showAlert = function(message){

  return new Promise(function(resolve){

    var modal = document.getElementById("hvModal");

    var msg = modal.querySelector(".hv-modal-message");

    var okBtn = document.getElementById("hvOkBtn");

    var cancelBtn = document.getElementById("hvCancelBtn");

    msg.textContent = message;

    cancelBtn.style.display = "none";

    modal.classList.add("show");

    okBtn.textContent = "OK";

    okBtn.onclick = function(){

      modal.classList.remove("show");

      resolve();

    };

  });

};

window.showConfirm = function(message){

  return new Promise(function(resolve){

    var modal = document.getElementById("hvModal");

    var msg = modal.querySelector(".hv-modal-message");

    var okBtn = document.getElementById("hvOkBtn");

    var cancelBtn = document.getElementById("hvCancelBtn");

    msg.textContent = message;
    okBtn.textContent = "Confirm";
    cancelBtn.textContent = "Cancel";

    cancelBtn.style.display = "inline-block";

    modal.classList.add("show");

    okBtn.onclick = function(){

      modal.classList.remove("show");

      resolve(true);

    };

    cancelBtn.onclick = function(){

      modal.classList.remove("show");

      resolve(false);

    };

  });

};

window.showToast = function(message){

  var toast = document.getElementById("toast");

  if(!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(function(){

    toast.classList.remove("show");

  },2000);

};



