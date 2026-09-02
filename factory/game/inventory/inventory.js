export function createInventoryController({
  button,
  popover,
  title,
  grid,
  detail,
  tabs,
  resourceGroups,
  sales,
  formatAmount,
  getMoney,
  setMoney,
  saveGameState,
  closeShop,
  enqueueWarehouseEmission,
  isWarehouseAvailable,
}) {
  const allResources = Object.values(resourceGroups).flat();
  const items = [
    { id: 'trash', catalogId: 1, name: 'Мусор', color: '#6f7780', image: 'assets/resources/trash.png', sellPrice: sales.trash },
    ...allResources.map((resource) => ({ ...resource, sellPrice: sales[resource.id] })),
  ];
  let inventory = { trash: 0 };
  let selectedItemId = null;
  let activeTab = 'all';
  let source = 'panel';
  let selectedWarehouse = null;

  function quantityFormMarkup(itemId, actionLabel, modifier = '') {
    const actionContent = modifier === 'inventory-sale'
      ? '<span>Продать</span><span data-sale-total>0 $</span>'
      : actionLabel;
    return `<form class="inventory-release${modifier ? ` ${modifier}` : ''}" data-item-id="${itemId}" data-release-value="">
      <output class="inventory-release-display" data-release-display>0</output>
      <div class="inventory-release-keypad">
        <button type="button" data-release-digit="1">1</button><button type="button" data-release-digit="2">2</button><button type="button" data-release-digit="3">3</button>
        <button type="button" data-release-digit="4">4</button><button type="button" data-release-digit="5">5</button><button type="button" data-release-digit="6">6</button>
        <button type="button" data-release-digit="7">7</button><button type="button" data-release-digit="8">8</button><button type="button" data-release-digit="9">9</button>
        <button class="inventory-release-clear" type="button" data-release-backspace aria-label="Удалить последнюю цифру">C</button><button type="button" data-release-digit="0">0</button><button class="inventory-release-all" type="button" data-release-all>all</button>
        <button class="inventory-release-confirm" type="submit">${actionContent}</button>
      </div>
    </form>`;
  }

  function setQuantityFormValue(form, value) {
    const nextValue = String(value);
    form.dataset.releaseValue = nextValue;
    form.querySelector('[data-release-display]').textContent = nextValue || '0';
    const saleTotal = form.querySelector('[data-sale-total]');
    const item = items.find((entry) => entry.id === form.dataset.itemId);
    if (saleTotal && item) saleTotal.textContent = `${formatAmount(Number(nextValue || 0) * item.sellPrice)} $`;
  }

  function renderDetail() {
    const item = items.find((entry) => entry.id === selectedItemId);
    const count = item ? Number(inventory[item.id] ?? 0) : 0;
    if (!item || count <= 0) {
      selectedItemId = null;
      detail.classList.remove('is-visible');
      detail.innerHTML = '';
      return;
    }
    const existingReleaseForm = detail.querySelector(`.inventory-release[data-item-id="${item.id}"]`);
    if (existingReleaseForm) {
      detail.querySelector('.inventory-detail-count').textContent = count;
      if (Number(existingReleaseForm.dataset.releaseValue) > count) {
        setQuantityFormValue(existingReleaseForm, count);
      }
      return;
    }
    detail.innerHTML = `
      <button class="inventory-detail-close" type="button" data-inventory-detail-close aria-label="Закрыть детали предмета">×</button>
      <strong>${item.name}</strong>
      <div class="inventory-detail-item-card${item.sellPrice > 0 ? ' has-price' : ''}">
        <i class="inventory-detail-preview" style="background:${item.image ? 'transparent' : item.color}" aria-hidden="true">${item.image ? `<img src="${item.image}" alt="">` : ''}</i>
        <span class="inventory-detail-count">${count}</span>
        ${item.sellPrice > 0 ? `<span class="inventory-detail-unit-price">${formatAmount(item.sellPrice)} $ за шт.</span>` : ''}
      </div>
      ${source === 'warehouse'
        ? quantityFormMarkup(item.id, 'Выгрузить')
        : item.sellPrice > 0
          ? quantityFormMarkup(item.id, 'Продать', 'inventory-sale')
          : '<span>Материал на складе</span>'}
    `;
    detail.classList.add('is-visible');
  }

  function render() {
    const tabItems = resourceGroups[activeTab] ?? items;
    const filledSlots = tabItems
      .filter((item) => Number(inventory[item.id] ?? 0) > 0)
      .map((item) => ({ ...item, count: Number(inventory[item.id]) }));
    const slots = [...filledSlots, ...Array.from({ length: 100 - filledSlots.length }, () => null)];
    const currentSlotIds = Array.from(grid.children, (slot) => slot.dataset.itemId ?? '');
    const nextSlotIds = slots.map((item) => item?.id ?? '');

    if (currentSlotIds.length === nextSlotIds.length
      && currentSlotIds.every((itemId, index) => itemId === nextSlotIds[index])) {
      slots.forEach((item, index) => {
        if (item) grid.children[index].querySelector('.inventory-count').textContent = item.count;
      });
      renderDetail();
      return;
    }

    grid.innerHTML = slots.map((item) => item
      ? `<button class="inventory-slot" type="button" data-item-id="${item.id}" title="${item.name}">
          <i class="inventory-item-icon" style="background:${item.image ? 'transparent' : item.color}" aria-hidden="true">${item.image ? `<img src="${item.image}" alt="">` : ''}</i>
          <span class="inventory-count">${item.count}</span>
        </button>`
      : '<div class="inventory-slot is-empty" aria-label="Пустая ячейка"><span class="inventory-count"></span></div>')
      .join('');
    renderDetail();
  }

  function add(itemId, amount = 1) {
    inventory[itemId] = Math.max(0, Number(inventory[itemId] ?? 0) + amount);
    render();
  }

  function setOpen(open, nextSource = 'panel', warehouse = null) {
    const wasOpen = popover.classList.contains('is-open');
    const previousSource = source;
    const previousWarehouse = selectedWarehouse;
    if (open) {
      source = nextSource;
      selectedWarehouse = nextSource === 'warehouse' ? warehouse : null;
    } else {
      source = 'panel';
      selectedWarehouse = null;
    }
    popover.classList.toggle('is-open', open);
    popover.dataset.source = source;
    popover.setAttribute('aria-label', source === 'warehouse' ? 'Инвентарь склада' : 'Инвентарь');
    title.textContent = source === 'warehouse' ? 'Склад' : 'Инвентарь';
    button.classList.toggle('is-active', open && source === 'panel');
    button.setAttribute('aria-expanded', String(open));
    if (wasOpen !== open || previousSource !== source || previousWarehouse !== selectedWarehouse) {
      selectedItemId = null;
      render();
    }
  }

  function replaceState(state) {
    if (!state || typeof state !== 'object') return;
    inventory = Object.fromEntries(Object.entries(state)
      .map(([itemId, count]) => [itemId, Math.max(0, Number(count) || 0)]));
    inventory.trash ??= 0;
  }

  tabs.addEventListener('click', (event) => {
    const tabButton = event.target.closest('button[data-tab]');
    if (!tabButton) return;
    activeTab = tabButton.dataset.tab;
    selectedItemId = null;
    tabs.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === tabButton));
    render();
  });

  button.addEventListener('click', () => {
    closeShop();
    const isPanelInventoryOpen = popover.classList.contains('is-open') && source === 'panel';
    setOpen(!isPanelInventoryOpen, 'panel');
  });

  popover.addEventListener('pointerdown', (event) => {
    if (!detail.classList.contains('is-visible') || detail.contains(event.target)) return;
    selectedItemId = null;
    renderDetail();
  });

  grid.addEventListener('click', (event) => {
    const slot = event.target.closest('[data-item-id]');
    selectedItemId = slot?.dataset.itemId ?? null;
    renderDetail();
  });

  detail.addEventListener('click', (event) => {
    if (event.target.closest('[data-inventory-detail-close]')) {
      selectedItemId = null;
      renderDetail();
      return;
    }
    const releaseForm = event.target.closest('.inventory-release[data-item-id]');
    if (!releaseForm) return;
    const digitButton = event.target.closest('[data-release-digit]');
    const currentValue = releaseForm.dataset.releaseValue ?? '';
    if (digitButton) {
      setQuantityFormValue(releaseForm, `${currentValue}${digitButton.dataset.releaseDigit}`.replace(/^0+/, ''));
    } else if (event.target.closest('[data-release-backspace]')) {
      setQuantityFormValue(releaseForm, currentValue.slice(0, -1));
    } else if (event.target.closest('[data-release-all]')) {
      setQuantityFormValue(releaseForm, Number(inventory[releaseForm.dataset.itemId] ?? 0));
    }
  });

  detail.addEventListener('submit', (event) => {
    const form = event.target.closest('.inventory-release[data-item-id]');
    if (!form) return;
    event.preventDefault();
    const count = Number(inventory[form.dataset.itemId] ?? 0);
    const quantity = Math.floor(Number(form.dataset.releaseValue));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > count) return;
    if (source === 'warehouse') {
      if (!selectedWarehouse || !isWarehouseAvailable(selectedWarehouse)) return;
      enqueueWarehouseEmission(selectedWarehouse, form.dataset.itemId, quantity);
    } else {
      const item = items.find((entry) => entry.id === form.dataset.itemId);
      if (!item || item.sellPrice <= 0) return;
      inventory[item.id] = count - quantity;
      setMoney(getMoney() + quantity * item.sellPrice);
      saveGameState();
    }
    selectedItemId = null;
    render();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!popover.classList.contains('is-open')) return;
    if (!popover.contains(event.target) && !button.contains(event.target)) setOpen(false);
  }, true);

  return {
    items,
    add,
    render,
    setOpen,
    getCount: (itemId) => Number(inventory[itemId] ?? 0),
    getState: () => ({ ...inventory }),
    replaceState,
  };
}
