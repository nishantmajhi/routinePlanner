document.addEventListener("DOMContentLoaded", () => {
  const select = document.querySelector("select");
  const output = document.querySelector("output");
  output.innerHTML = "";

  select.addEventListener("change", (event) => {
    const selectedOption = select.options[select.selectedIndex];
    const code = selectedOption.value;
    const label = selectedOption.textContent;

    if (!code || teacherData.subjects_array.includes(code)) return;

    teacherData.subjects_array.push(code);
    selectedOption.style.display = "none";

    renderSubjectCard(code, label, output, select);
    output.style.display = "flex";
    select.selectedIndex = 0;

    updateOptgroupVisibility(select);
  });
});

function renderSubjectCard(code, label, output, select) {
  const span = document.createElement("span");
  span.className = "subject";
  span.title = "Click to remove";
  span.textContent = label;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "✖️";

  button.addEventListener("click", () => {
    teacherData.subjects_array = teacherData.subjects_array.filter(
      (subject) => subject !== code
    );

    output.removeChild(span);

    const optionToShow = select.querySelector(`option[value="${code}"]`);
    if (optionToShow) optionToShow.style.display = "";

    updateOptgroupVisibility(select);

    if (teacherData.subjects_array.length === 0) {
      output.style.display = "none";
    }
  });

  span.appendChild(button);
  output.appendChild(span);
}

function updateOptgroupVisibility(select) {
  const optgroups = select.querySelectorAll("optgroup");

  optgroups.forEach((group) => {
    const hasVisibleOption = Array.from(group.querySelectorAll("option")).some(
      (option) => option.style.display !== "none"
    );
    group.style.display = hasVisibleOption ? "" : "none";
  });
}