import { useEffect, useState } from "react";
import { apiUrl } from '../../utils/api';

export default function MealsDebugHeaders() {
  useEffect(() => {
    console.log("Running MealsDebugHeaders");
    const token = localStorage.getItem("token");
    console.log("Token used for meals request:", token);
    fetch(apiUrl('/meals/'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        const body = await r.json().catch(() => ({}));
        // eslint-disable-next-line no-console
        console.log("/api/meals/ response status:", r.status);
        console.log("/api/meals/ response headers:", Array.from(r.headers.entries()));
        console.log("/api/meals/ response body:", body);
      });
  }, []);
  return null;
}
