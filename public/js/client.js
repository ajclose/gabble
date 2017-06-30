const deleteForm = document.querySelectorAll("form.delete");
if (deleteForm){
  for (var i = 0; i < deleteForm.length; i++) {
    deleteForm[i].addEventListener("submit", function(event){
      if (confirm("Are you sure you want to delete this gab?") !== true ){
        event.preventDefault();
      }
    })

  }
  
}
