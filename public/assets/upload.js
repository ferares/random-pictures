function locationAdd() {
  const locationTemplate = document.querySelector('[js-location-template]')
  const locationsList = document.querySelector('[js-locations]')
  const location = locationTemplate.content.cloneNode(true)
  locationsList.append(location)
  const locationElement = locationsList.querySelector('[js-location="[{}]"]')
  locationElement.innerHTML = locationElement.innerHTML.replaceAll('{}', `${window.locationsIndex}`)
  locationElement.setAttribute('js-location', `[${window.locationsIndex}]`)
  const locationRemoveBtn = locationElement.querySelector('[js-location-remove]')
  locationRemoveBtn.addEventListener('click', locationRemove)
  window.locationsIndex++
}

function locationRemove(event) {
  const locationRemoveBtn = event.currentTarget
  const locationNumber = locationRemoveBtn.getAttribute('js-location-remove')
  const location = document.querySelector(`[js-location="[${locationNumber}]"]`)
  location.remove()
}

document.addEventListener('DOMContentLoaded', () =>{
  window.locationsIndex = 0
  const locationAddBtns = document.querySelectorAll('[js-location-add]')
  for (const locationAddBtn of locationAddBtns) {
    locationAddBtn.addEventListener('click', locationAdd)
  }
  const locationRemoveBtns = document.querySelectorAll('[js-location-remove]')
  for (const locationRemoveBtn of locationRemoveBtns) {
    locationRemoveBtn.addEventListener('click', locationRemove)
  }

  if (locationRemoveBtns.length === 0) locationAdd()
})