// ============================
// Inisialisasi Base Maps
// ============================
const baseMaps = {
  'osm': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }),
  'world imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: ''
  }),
  'terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: ''
  })
};

// ============================
// Inisialisasi Peta
// ============================
const map = L.map('map', {
  center: [-6.855, 107.65],
  zoom: 11,
  layers: [baseMaps['osm']],
  attributionControl: false
});

let currentBaseLayer = baseMaps['osm'];

//============================
// Inisialisasi Search / Geocoder Control
//============================
L.Control.geocoder({
  defaultMarkGeocode: true,
  placeholder: 'Cari desa atau kecamatan...',
  geocoder: L.Control.Geocoder.nominatim(), // default
  position: 'topleft'
}).addTo(map);


// ============================
// Fungsi Ganti Base Map
// ============================
function changeBaseMap(type) {
  if (baseMaps[type]) {
    map.removeLayer(currentBaseLayer);
    currentBaseLayer = baseMaps[type];
    currentBaseLayer.addTo(map);
  }
}

document.getElementById('basemap-select').addEventListener('change', function () {
  changeBaseMap(this.value);
});

// ============================
// Tampilkan Koordinat Mouse
// ============================
map.on('mousemove', function (e) {
  document.getElementById('koordinat').innerHTML =
    `Koordinat: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
});

// ============================
// Deklarasi Layer
// ============================
let lulcLayer, lahanKritisLayer, batasKecamatanLayer, batasDesaLayer;

// ============================
// Style Lahan Kritis
// ============================
function styleLahanKritis(feature) {
  const kategori = feature.properties.FolderPath.split("/").pop();
  const warnaKategori = {
    "Sangat Kritis": "#FF0000",
    "Kritis": "#FFA500",
    "Agak Kritis": "#FFFF00",
    "Potensial Kritis": "#4CE600",
    "Tidak Kritis": "#007206"
  };

  return {
    fillColor: warnaKategori[kategori] || "#000",
    color: 'black',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.9
  };
}

// ============================
// Load Lahan Kritis Layer
// ============================
fetch('asset/data/lahankritis1.geojson')
  .then(res => res.json())
  .then(data => {
    lahanKritisLayer = L.geoJSON(data, {
      style: styleLahanKritis,
      onEachFeature: (feature, layer) => {
        const kategori = feature.properties.FolderPath.split("/").pop();
        layer.bindPopup(`<strong>Kelas:</strong> ${kategori}`);
      }
    });
  });

// ============================
// Load Batas Kecamatan
// ============================
fetch('asset/data/Kecamatan.geojson')
  .then(res => res.json())
  .then(data => {
    batasKecamatanLayer = L.geoJSON(data, {
      style: {
        color: "#000000",
        weight: 2,
        dashArray: '6, 4',
        fillOpacity: 0
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Kecamatan:</strong> ${feature.properties.WADMKC}`);
      }
    });
    toggleLayer('chk-kecamatan', batasKecamatanLayer);
  });

// ============================
// Load Batas Desa
// ============================
fetch('asset/data/desa.geojson')
  .then(res => res.json())
  .then(data => {
    batasDesaLayer = L.geoJSON(data, {
      style: {
        color: "#000000",
        weight: 1,
        dashArray: '2, 4',
        fillOpacity: 0
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Desa:</strong> ${feature.properties.NAMOBJ}`);
      }
    });
    toggleLayer('chk-desa', batasDesaLayer);
  });

// ============================
// Load LULC Layer
// ============================
fetch('asset/data/LULC.geojson')
  .then(res => res.json())
  .then(data => {
    lulcLayer = L.geoJSON(data, {
      style: function (feature) {
        const warnaLULC = {
          "Hutan": "#267300",
          "Perkebunan/Kebun": "#4CE600",
          "Sawah": "#00FFC5",
          "Tegalan/Ladang": "#FFFF73",
          "Tanah Kosong": "#FFFFFF",
          "Semak Belukar": "#A3FF73",
          "Danau": "#BFD9F2",
          "Permukiman": "#FEC9BF"
        };
        return {
          fillColor: warnaLULC[feature.properties.REMARK] || "#ccc",
          color: "black",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.9
        };
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>Penggunaan Lahan:</strong> ${feature.properties.REMARK}`);
      }
    });
  });

// ============================
// Tombol Reset View
// ============================
L.Control.ResetView = L.Control.extend({
  onAdd: function () {
    const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    btn.innerHTML = '<i class="fas fa-rotate-right"></i>';
    btn.title = 'Reset Peta';
    btn.style.cssText = `
      background-color: #fff;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    btn.onclick = function () {
      map.setView([-6.855, 107.65], 11);
      map.removeLayer(currentBaseLayer);
      currentBaseLayer = baseMaps['osm'];
      currentBaseLayer.addTo(map);
      document.getElementById('basemap-select').value = 'osm';
    };
    return btn;
  },
  onRemove: function () {}
});

L.control.resetView = opts => new L.Control.ResetView(opts);
L.control.resetView({ position: 'topleft' }).addTo(map);

// ============================
// Toggle Legenda
// ============================
const legend = document.getElementById('legend');
document.getElementById('toggle-legend').addEventListener('change', function () {
  legend.style.display = this.checked ? 'block' : 'none';
});

// ============================
// Fungsi Toggle Layer Checkbox
// ============================
function toggleLayer(id, layer) {
  document.getElementById(id).addEventListener('change', function () {
    this.checked ? map.addLayer(layer) : map.removeLayer(layer);
  });
}

// ============================
// Tambahkan Semua Layer ke Map Sesuai Urutan Tampilan
// ============================
setTimeout(() => {
  if (lulcLayer) map.addLayer(lulcLayer);
  if (lahanKritisLayer) map.addLayer(lahanKritisLayer);
  if (batasKecamatanLayer) map.addLayer(batasKecamatanLayer);
  if (batasDesaLayer) map.addLayer(batasDesaLayer);

  if (lahanKritisLayer) toggleLayer('chk-lahan', lahanKritisLayer);
  if (batasKecamatanLayer) toggleLayer('chk-kecamatan', batasKecamatanLayer);
  if (batasDesaLayer) toggleLayer('chk-desa', batasDesaLayer);
  if (lulcLayer) toggleLayer('chk-lulc', lulcLayer);
}, 1000);

