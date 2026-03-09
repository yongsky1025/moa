document.addEventListener("DOMContentLoaded", () => {
  const els = {
    name: document.querySelector('[data-user="name"]'),
    nickname: document.querySelector('[data-user="nickname"]'),
    address: document.querySelector('[data-user="address"]'),
    email: document.querySelector('[data-user="email"]'),
    phone: document.querySelector('[data-user="phone"]'),
    age: document.querySelector('[data-user="age"]'),
    birthDate: document.querySelector('[data-user="birthDate"]'),
    userGender: document.querySelector('[data-user="userGender"]'),
  };

  fetch("/users/me")
    .then((res) => {
      if (res.status === 401) {
        window.location.href = "/users/login";
        return null;
      }
      if (!res.ok) {
        throw new Error(`프로필 정보를 불러오는데 실패했습니다. (상태: ${res.status})`);
      }
      return res.json();
    })
    .then((profile) => {
      if (!profile) return;

      const userGenderMap = { MALE: "남성", FEMALE: "여성" };
      els.name.textContent = profile.name ?? "-";
      els.email.textContent = profile.email ?? "-";
      els.age.textContent = profile.age ?? "-";
      els.nickname.textContent = profile.nickname ?? "-";
      els.birthDate.textContent = profile.birthDate ?? "-";
      els.phone.textContent = profile.phone ?? "-";
      els.address.textContent = profile.address ?? "-";
      els.userGender.textContent = userGenderMap[profile.userGender] ?? "-";
    })
    .catch((err) => {
      console.error(err);
    });
});
