"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerPositionIcon, userPositionIcon } from "./icons";
import axios from "axios";

const Map = () => {
  const [position, setPosition] = useState({
    lng: 51.3347,
    lat: 35.7219,
  });
  const [markerPosition, setMarketPosition] = useState(null);
  const [addressUser, setAddressUser] = useState();
  const [search, setSearch] = useState("");
  const mapRef = useRef(null);

  const LocationMarker = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    useMapEvent({
      click(e) {
        const newPosition = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        setMarketPosition(newPosition);
      },
    });
    return null;
  };

  const handleNewPosition = () => {
    markerPosition && setPosition(markerPosition);
    setMarketPosition(null);
  };

  const getLocation = async ({ lat, lng }) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=fa&extratags=1&namedetails=1&polygon_geojson=1`
    );
    if (response.data.address) {
      const address = [
        response.data.address.country,
        response.data.address.city,
        response.data.address.neighbourhood,
        response.data.address.suburb,
        response.data.address.road,
      ]
        .filter(Boolean)
        .join(", ");
      return address;
    } else {
      throw new Error("آدرس وجود ندارد");
    }
  };

  const getSearchLocation = async (search) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${search}&format=json&addressdetails=1&accept-language=fa`
    );
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      throw new Error("موقعیت پیدا نشد");
    }
  };

  console.log(addressUser);

  const handleSearch = async (e) => {
    e.preventDefault();
    const { lat, lng } = await getSearchLocation(search);
    mapRef.current?.flyTo({ lat, lng }, 14);
  };

  useEffect(() => {
    getLocation(position).then((response) => {
      setAddressUser(response);
    });
  }, [position]);

  return (
    <div className="flex flex-col gap-5 w-full bg-white p-6 max-w-4xl h-[800px] rounded-xl border border-gray-300 shadow-sm">
      <form className="flex w-full items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 w-full bg-slate-100 h-12 rounded-xl outline-none focus:border-rose-600 indent-5"
          placeholder="شهر مورد نظر خود را جستجو کنید ..."
          type="text"
        />
        <button
          type="submit"
          className="bg-rose-600 text-white h-12 px-9 rounded-lg"
          onClick={handleSearch}
        >
          جستجو
        </button>
      </form>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", borderRadius: "15px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setMarketPosition={setMarketPosition} />
        <Marker position={position} icon={userPositionIcon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        {markerPosition && (
          <Marker position={markerPosition} icon={markerPositionIcon}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-[#555] text-lg font-semibold">{addressUser}</p>
        </div>
        <button
          className="bg-rose-600 text-white h-12 px-9 rounded-lg"
          onClick={handleNewPosition}
        >
          تایید موقعیت کاربر
        </button>
      </div>
    </div>
  );
};

export default Map;
