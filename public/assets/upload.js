function locationAdd() {
  const locationTemplate = document.querySelector('[js-location-template]')
  const locationsList = document.querySelector('[js-locations]')
  const location = locationTemplate.content.cloneNode(true)
  locationsList.append(location)
  const locationElement = locationsList.querySelector('[js-location="[{}]"]')
  locationElement.innerHTML = locationElement.innerHTML.replaceAll('{}', `${window.locationsIndex}`)
  locationElement.setAttribute('js-location', `[${window.locationsIndex}]`)
  const locationRemoveBtn = locationElement.querySelector('[js-location-remove]')
  locationRemoveBtn.addEventListener('click', () => locationRemove(locationRemoveBtn))
  window.locationsIndex++
  window.locationsCount++
  updateRemoveBtns()
}

function locationRemove(locationRemoveBtn) {
  const locationNumber = locationRemoveBtn.getAttribute('js-location-remove')
  const location = document.querySelector(`[js-location="[${locationNumber}]"]`)
  location.remove()
  window.locationsCount--
  updateRemoveBtns()
}

function updateRemoveBtns() {
  const locationRemoveBtns = document.querySelectorAll('[js-location-remove]')
  for (const locationRemoveBtn of locationRemoveBtns) {
    if (window.locationsCount > 1) {
      locationRemoveBtn.style.display = 'block'
    } else {
      locationRemoveBtn.style.display = 'none'
    }
  }
}

function verifyForm(form) {
  form.classList.add('was-validated')
  const indexes = form.elements['index[]']
  if ((!indexes.value) && (!indexes.length)) return false
  return form.checkValidity()
}

async function submitLocation(form, index) {
  const name = form.elements.name.value
  const link = form.elements.link.value
  const captcha = form.elements['h-captcha-response'].value
  const data = new FormData()
  data.append('name', name)
  data.append('link', link)
  data.append('h-captcha-response', captcha)
  const location = form.elements[`locations[${index}]`].value
  data.append('location', location)
  const pictures = form.elements[`pictures[${index}]`].files
  for (const picture of pictures) {
    data.append('pictures', picture)
  }
  return fetch(form.action, { method: 'post', body: data }).then((res) => res.json())
}

function submit(event) {
  event.preventDefault()
  const form = event.currentTarget
  if (!verifyForm(form)) return
  const fieldset = form.querySelector('fieldset')
  fieldset.setAttribute('disabled', true)
  window.hcaptcha.execute({ async: true }).then(() => {
    let indexes = form.elements['index[]']
    if (!indexes.length) indexes = [indexes]
    let locationsCount = indexes.length
    let failureCount = indexes.length
    for (const index of indexes) {
      submitLocation(form, index.value).then((res) => {
        locationsCount--
        if (res.success) {
          failureCount--
          if (locationsCount > 0) {
            locationRemove(document.querySelector(`[js-location-remove="${index.value}"]`))
          }
        }
        if (locationsCount === 0) {
          form.classList.remove('was-validated')
          form.reset()
          fieldset.removeAttribute('disabled')
          if (failureCount === 0) {
            alert('Todas sus fotos fueron enviadas con éxito y están pendientes de aprobación.')
          } else {
            alert('Algunas de sus fotos no pudieron ser enviadas con éxito. Intente nuevamente.')
          }
        }
      })
    }
  })
} 

document.addEventListener('DOMContentLoaded', () =>{
  window.locationsIndex = 0
  window.locationsCount = 0
  const locationAddBtns = document.querySelectorAll('[js-location-add]')
  for (const locationAddBtn of locationAddBtns) {
    locationAddBtn.addEventListener('click', locationAdd)
  }
  const locationRemoveBtns = document.querySelectorAll('[js-location-remove]')
  for (const locationRemoveBtn of locationRemoveBtns) {
    locationRemoveBtn.addEventListener('click', () => locationRemove(locationRemoveBtn))
  }

  if (locationRemoveBtns.length === 0) locationAdd()

  const form = document.querySelector('[js-form]')
  form.addEventListener('submit', submit)
})