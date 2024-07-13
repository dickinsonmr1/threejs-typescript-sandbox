

export class HudDivElementManager {

    divElements: HTMLDivElement[] = [];
    
    currentX: number;
    currentY: number;

    paddingX: number;
    paddingY: number;
    
    // TODO: add texture
    constructor(startX: number, startY: number, paddingX: number, paddingY: number) {
        this.currentX = startX;
        this.currentY = startY;  

        this.paddingX = paddingX;      
        this.paddingY = paddingY;      
    }

    addElement(name: string, text: string) {
        //this.currentX += this.paddingX;
        this.currentY += this.paddingY;        

        let divElement = this.generateDivElement(name, this.currentX, this.currentY, text);
        this.divElements.push(divElement);
    }

    updateElementText(name: string, text: string) {
        let element = this.divElements.find(x => x.id == name);
        
        if(element != null)
            element.innerHTML = text;
    }
   
    private generateDivElement(name: string, screenX: number, screenY: number, text: string): HTMLDivElement {
        let div = document.createElement('div');
        div.id = name;
        div.style.position = 'absolute';
        //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        div.style.width = "200";
        div.style.height = "200";        
        div.style.color = "white";
        div.style.backgroundColor = "blue";
        div.innerHTML = text;
        div.style.left = screenX + 'px';
        div.style.top = screenY + 'px';
        document.body.appendChild(div);
        
        return div;
    }
}