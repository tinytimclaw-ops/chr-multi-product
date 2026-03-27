// CHR Brand Map
const CHR_BRANDS = {
  LHR: { name: "Heathrow Parking", slug: "heathrowparking" },
  LGW: { name: "Gatwick Parking", slug: "gatwickparking" },
  MAN: { name: "Manchester Parking", slug: "manchesterairport" },
  STN: { name: "Stansted Parking", slug: "stanstedparking" },
  LTN: { name: "Luton Parking", slug: "lutonparking" },
  BHX: { name: "Birmingham Parking", slug: "birminghamairport" },
  EDI: { name: "Edinburgh Parking", slug: "edinburghairport" },
  BRS: { name: "Bristol Parking", slug: "bristolairport" },
  NCL: { name: "Newcastle Parking", slug: "newcastleairport" },
  LBA: { name: "Leeds Bradford Parking", slug: "leedsbradfordairport" },
};

const DEFAULT_BRAND = { name: "Airport Parking", slug: "heathrowparking" };

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeBranding();
  initializeDates();
  initializeProductTabs();
  initializeForms();
});

// Set brand identity from Location URL param
function initializeBranding() {
  const urlParams = new URLSearchParams(window.location.search);
  const depart = (urlParams.get("Location") || urlParams.get("location") || "").toUpperCase();
  const brand = CHR_BRANDS[depart] || DEFAULT_BRAND;

  // Set logo
  const logoUrl = `https://s3.amazonaws.com/theme-media/img/brand/${brand.slug}-icon.png`;
  const logoEl = document.getElementById("brandLogo");
  logoEl.src = logoUrl;
  logoEl.alt = brand.name;

  // Fallback if airport has no icon
  logoEl.onerror = () => {
    logoEl.src = "https://s3.amazonaws.com/theme-media/img/brand/heathrowparking-icon.png";
  };

  // Set brand name
  document.getElementById("brandName").textContent = brand.name;
  document.title = brand.name;
}

// Date helper
function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dateStrPlus(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Initialize date fields with defaults
function initializeDates() {
  // Parking dates
  const parkingOutDate = document.getElementById('parkingOutDate');
  const parkingInDate = document.getElementById('parkingInDate');
  parkingOutDate.value = datePlus(1);
  parkingInDate.value = datePlus(1 + 8);

  let parkingInManuallyChanged = false;
  parkingInDate.addEventListener('change', () => {
    parkingInManuallyChanged = true;
  });

  parkingOutDate.addEventListener('change', () => {
    if (!parkingInManuallyChanged) {
      parkingInDate.value = dateStrPlus(parkingOutDate.value, 8);
    }
  });

  // Hotel + Parking dates
  const hpStayDate = document.getElementById('hpStayDate');
  const hpInDate = document.getElementById('hpInDate');
  hpStayDate.value = datePlus(1);
  hpInDate.value = datePlus(1 + 9); // stayDate + 9 (outDate + 8)

  let hpInManuallyChanged = false;
  hpInDate.addEventListener('change', () => {
    hpInManuallyChanged = true;
  });

  hpStayDate.addEventListener('change', () => {
    if (!hpInManuallyChanged) {
      hpInDate.value = dateStrPlus(hpStayDate.value, 9);
    }
  });

  // Hotel Only dates
  const hotelStayDate = document.getElementById('hotelStayDate');
  hotelStayDate.value = datePlus(1);

  // Lounge dates
  const loungeOutDate = document.getElementById('loungeOutDate');
  loungeOutDate.value = datePlus(1);
}

// Product tab switching
function initializeProductTabs() {
  const tabs = document.querySelectorAll('.product-tab');
  const forms = document.querySelectorAll('.search-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const product = tab.dataset.product;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update visible form
      forms.forEach(f => f.classList.remove('active'));
      const targetForm = document.querySelector(`.search-form[data-product="${product}"]`);
      if (targetForm) {
        targetForm.classList.add('active');
      }
    });
  });
}

// Form submissions
function initializeForms() {
  // Parking form
  document.getElementById('parkingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const airport = document.getElementById('parkingAirport').value;
    const outDate = document.getElementById('parkingOutDate').value;
    const outTime = document.getElementById('parkingOutTime').value;
    const inDate = document.getElementById('parkingInDate').value;
    const inTime = document.getElementById('parkingInTime').value;

    if (!airport || !outDate || !inDate) {
      alert('Please complete all fields');
      return;
    }

    const url = buildParkingUrl(airport, outDate, outTime, inDate, inTime);
    window.location.href = url;
  });

  // Hotel + Parking form
  document.getElementById('hotelParkingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const airport = document.getElementById('hpAirport').value;
    const stayDate = document.getElementById('hpStayDate').value;
    const roomType = document.getElementById('hpRoomType').value;
    const inDate = document.getElementById('hpInDate').value;

    if (!airport || !stayDate || !roomType || !inDate) {
      alert('Please complete all fields');
      return;
    }

    const outDate = dateStrPlus(stayDate, 1); // outDate = stayDate + 1
    const url = buildHotelParkingUrl(airport, stayDate, outDate, inDate, roomType);
    window.location.href = url;
  });

  // Hotel Only form
  document.getElementById('hotelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const airport = document.getElementById('hotelAirport').value;
    const stayDate = document.getElementById('hotelStayDate').value;
    const roomType = document.getElementById('hotelRoomType').value;

    if (!airport || !stayDate || !roomType) {
      alert('Please complete all fields');
      return;
    }

    const outDate = dateStrPlus(stayDate, 1); // checkout = stayDate + 1
    const url = buildHotelUrl(airport, stayDate, outDate, roomType);
    window.location.href = url;
  });

  // Lounge form
  document.getElementById('loungeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const airport = document.getElementById('loungeAirport').value;
    const outDate = document.getElementById('loungeOutDate').value;
    const outTime = document.getElementById('loungeOutTime').value;
    const adults = document.getElementById('loungeAdults').value;
    const children = document.getElementById('loungeChildren').value;

    if (!airport || !outDate || !adults) {
      alert('Please complete all fields');
      return;
    }

    const url = buildLoungeUrl(airport, outDate, outTime, adults, children);
    window.location.href = url;
  });
}

// Domain resolution (CHR stays on www)
function getBaseDomain() {
  const host = window.location.host;
  const isLocal = host.startsWith("127") || host.includes("github.io");
  return isLocal ? "www.holidayextras.com" : host;
}

// Get URL params
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    agent: urlParams.get('agent') || 'WY992',
    adcode: urlParams.get('adcode') || '',
    promotionCode: urlParams.get('promotionCode') || '',
    flight: urlParams.get('flight') || 'default'
  };
}

// Build parking search URL
function buildParkingUrl(depart, outDate, outTime, inDate, inTime) {
  const basedomain = getBaseDomain();
  const params = getUrlParams();
  const outTimeEncoded = outTime.replace(':', '%3A');
  const inTimeEncoded = inTime.replace(':', '%3A');

  return `https://${basedomain}/static/?selectProduct=cp&#/categories?agent=${params.agent}&ppts=&customer_ref=&lang=en&adults=2&depart=${depart}&terminal=&arrive=&flight=${params.flight}&in=${inDate}&out=${outDate}&park_from=${outTimeEncoded}&park_to=${inTimeEncoded}&filter_meetandgreet=&filter_parkandride=&children=0&infants=0&redirectReferal=carpark&from_categories=true&adcode=${params.adcode}&promotionCode=${params.promotionCode}`;
}

// Build hotel + parking search URL
function buildHotelParkingUrl(depart, stayDate, outDate, inDate, roomType) {
  const basedomain = getBaseDomain();
  const params = getUrlParams();

  return `https://${basedomain}/static/?selectProduct=hcp&#/hotel_with_parking?agent=${params.agent}&ppts=0&customer_ref=&lang=en&depart=${depart}&terminal=&arrive=&flight=${params.flight}&in=${inDate}&out=${outDate}&stay=${stayDate}&room_1=${roomType}&room_2=&adcode=${params.adcode}&promotionCode=${params.promotionCode}`;
}

// Build hotel only search URL
function buildHotelUrl(depart, stayDate, outDate, roomType) {
  const basedomain = getBaseDomain();
  const params = getUrlParams();

  return `https://${basedomain}/static/?selectProduct=ho&#/hotel?agent=${params.agent}&ppts=&customer_ref=&lang=en&depart=${depart}&terminal=&arrive=&flight=${params.flight}&out=${outDate}&stay=${stayDate}&room_1=${roomType}&room_2=&adcode=${params.adcode}&promotionCode=${params.promotionCode}`;
}

// Build lounge search URL
function buildLoungeUrl(depart, outDate, outTime, adults, children) {
  const basedomain = getBaseDomain();
  const params = getUrlParams();
  const outTimeEncoded = outTime.replace(':', '%3A');
  const infants = 0;

  return `https://${basedomain}/static/?selectProduct=lo&#/lounge?agent=${params.agent}&ppts=&customer_ref=&lang=en&adults=${adults}&children=${children}&infants=${infants}&depart=${depart}&terminal=&arrive=&flight=${params.flight}&from=${outDate}%20${outTimeEncoded}&adcode=${params.adcode}&promotionCode=${params.promotionCode}`;
}
