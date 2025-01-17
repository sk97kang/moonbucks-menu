import { $ } from "./utils/dom.js";
import MenuApi from "./api/index.js";

function App() {
  // 상태는 변하는 데이터, 이 앱에서 변하는 것이 무언인가 - 메뉴명
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  this.currentCategory = "espresso";

  this.init = async () => {
    render();
    initEventListeners();
  };

  const changeCategory = async (e) => {
    const isCategoryButton = e.target.classList.contains("cafe-category-name");
    if (!isCategoryButton) return;
    const categoryName = e.target.dataset.categoryName;
    this.currentCategory = categoryName;
    $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
    render();
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    const template = this.menu[this.currentCategory]
      .map((item) => {
        return `
        <li data-menu-id=${
          item.id
        } class="menu-list-item d-flex items-center py-2">
          <span class="w-100 pl-2 menu-name ${
            item.isSoldOut ? "sold-out" : ""
          }">${item.name}</span>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
          >
            품절
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
          >
            수정
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
          >
            삭제
          </button>
        </li>
        `;
      })
      .join("");
    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  const updateMenuCount = () => {
    const menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  };

  const addMenuName = async () => {
    const menuName = $("#menu-name").value;
    if (menuName === "") return alert("값을 입력해주세요.");
    if (
      this.menu[this.currentCategory].find((menu) => menu.name === menuName)
    ) {
      alert("이미 등록된 메뉴입니다. 다시 입력해주세요.");
      $("#menu-name").value = "";
      return;
    }
    await MenuApi.createMenu(this.currentCategory, menuName);
    render();
    $("#menu-name").value = "";
  };

  const updateMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요", $menuName.innerText);
    if (updatedMenuName === "") return;
    await MenuApi.updateMenu(this.currentCategory, updatedMenuName, menuId);
    render();
  };

  const removeMenuName = async (e) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.deleteMenu(this.currentCategory, menuId);
    render();
  };

  const soldOutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
    render();
  };

  const initEventListeners = () => {
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") return;
      addMenuName();
    });

    $("nav").addEventListener("click", changeCategory);
  };
}

const app = new App();
app.init();
