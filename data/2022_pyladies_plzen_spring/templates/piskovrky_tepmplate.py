def vyhodnot(pole):
    """Vstupmen funkce je řetezec herního pole.
    Funkce vyhodnotí stav hry. Jenou z možností jak stav hry sledovat, je 
    ověření výskyu rozhodující sekvence znaku (např. "xxx" nebo "ooo")
    """
    ...


def tah_hrace(pole, hrac):
    """Vstupem funkce je řetězec s herním polem a znak hráče. 
    Funkce se dotáže uživatele na číslo pozice na kterou che umístit svůj znak. 
    Funkce následně ověří, zda-li je pozice není  obsazená a 
    lze na ni znak umístit.Pokud ano, 
    vrátí upravené herní pole se zaznamenaným tahem hráče.
    """
    ...


def tah_pocitace(pole, hrac):
    """Vstupem funkce je řetězec s herním polem a znak hráče. 
    Funkce vygeneruje náhdné čísli pole, na které počítač bude hrát a vrátí
    a vrátí upravené herní pole se zaznamenaným tahem počítače
    """
    ...


def znak_hrace():
    """Funkcem která má za úkol vrátit znak, který si hráč zvolí."""
    ...


def piskvorky():
    """Funkce vytvoří pole a přiřadí znak hráči a počítači. 
    K přiřazení zanku hráči je využita funkce "znak hráče". Střídavě jsou 
    volány funkce tah_hrace a tah_pocitacem s průběžnou kontrolou stavu hry.
     """
    ...


piskvorky()
