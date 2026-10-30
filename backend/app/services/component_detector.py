import re
from typing import Dict, List, Any

class ComponentDetector:
    @staticmethod
    def detect_components(elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans DOM element bounding boxes, selectors, and tags to detect reusable components:
        Headers, Navigations, Footers, Buttons, Cards, Modals, Forms, Inputs, etc.
        """
        detected: List[Dict[str, Any]] = []
        seen_selectors = set()

        for el in elements:
            tag = el.get("tagName", "")
            classes = el.get("classes", [])
            selector = el.get("selector", "")
            rect = el.get("rect", {})
            styles = el.get("styles", {})
            text = el.get("text") or ""
            classes_str = " ".join(classes).lower()

            category = None
            comp_name = None
            reusability = 0.5
            confidence = 0.85

            # 1. Navigation / Header
            if tag in ("header", "nav") or any(k in classes_str for k in ["navbar", "nav-bar", "header", "top-bar"]):
                category = "header" if "header" in classes_str or tag == "header" else "navigation"
                comp_name = f"Site{category.capitalize()}"
                reusability = 0.95
                confidence = 0.95

            # 2. Footer
            elif tag == "footer" or any(k in classes_str for k in ["footer", "site-footer"]):
                category = "footer"
                comp_name = "SiteFooter"
                reusability = 0.95
                confidence = 0.95

            # 3. Buttons
            elif tag == "button" or (tag == "a" and any(k in classes_str for k in ["btn", "button", "cta"])):
                category = "button"
                clean_text = re.sub(r'[^a-zA-Z0-9]', '', text)[:15]
                comp_name = f"Button_{clean_text}" if clean_text else "PrimaryButton"
                reusability = 0.9
                confidence = 0.9

            # 4. Cards / Surface Containers
            elif any(k in classes_str for k in ["card", "item", "box", "tile", "surface"]) and rect.get("width", 0) > 150:
                category = "card"
                comp_name = "ContentCard"
                reusability = 0.85
                confidence = 0.85

            # 5. Forms & Inputs
            elif tag == "form" or any(k in classes_str for k in ["form", "search-form", "login-form"]):
                category = "form"
                comp_name = "InputForm"
                reusability = 0.8
                confidence = 0.9

            elif tag in ("input", "textarea", "select"):
                category = "input"
                comp_name = f"Form_{tag.capitalize()}"
                reusability = 0.9
                confidence = 0.9

            # 6. Sidebar
            elif tag == "aside" or any(k in classes_str for k in ["sidebar", "drawer"]):
                category = "sidebar"
                comp_name = "NavigationSidebar"
                reusability = 0.85
                confidence = 0.9

            # 7. Modal / Dialog
            elif tag == "dialog" or any(k in classes_str for k in ["modal", "dialog", "popup"]):
                category = "modal"
                comp_name = "ModalDialog"
                reusability = 0.8
                confidence = 0.9

            if category and selector not in seen_selectors:
                seen_selectors.add(selector)
                detected.append({
                    "name": comp_name,
                    "category": category,
                    "bounding_box": rect,
                    "visual_properties": {
                        "backgroundColor": styles.get("backgroundColor"),
                        "borderRadius": styles.get("borderRadius"),
                        "boxShadow": styles.get("boxShadow"),
                        "padding": styles.get("padding"),
                        "display": styles.get("display")
                    },
                    "dom_selector": selector,
                    "css_properties": styles,
                    "interaction_desc": f"Interactive {category} element responding to user clicks and focus.",
                    "responsive_behavior": f"Renders at {rect.get('width', 0)}x{rect.get('height', 0)}px in active viewport.",
                    "reusability_score": reusability,
                    "confidence_score": confidence,
                    "occurrences_count": 1
                })

        return detected

component_detector = ComponentDetector()
