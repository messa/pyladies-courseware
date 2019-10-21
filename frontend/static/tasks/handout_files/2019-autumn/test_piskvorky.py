import pytest
import builtins

# Tady by normálně byly importy (např. "from piskvorky import vyhodnot").
# Aby základní testy fungovaly i když některé moduly ještě nejsou napsané,
# jsou importy až v testovacích funkcích. To se normálně nedělá.

@pytest.mark.level(1)
def test_import_vyhodnot():
    """Funkce piskvorky.vyhodnot se dá naimportovat"""
    from piskvorky import vyhodnot


@pytest.mark.level(2)
def test_vyhodnot_vyhru_x():
    """Křížky vyhrály"""
    from piskvorky import vyhodnot
    assert vyhodnot('xxx-----------------') == 'x'


@pytest.mark.level(2)
def test_vyhodnot_vyhru_o():
    """Kolečka vyhrála"""
    from piskvorky import vyhodnot
    assert vyhodnot('ooo-----------------') == 'o'


@pytest.mark.level(3)
def test_vyhodnot_remizu():
    """Nastala remíza"""
    from piskvorky import vyhodnot
    assert vyhodnot('oxoxoxoxoxoxoxoxoxox') == '!'
    assert vyhodnot('xxooxxooxxooxxooxxoo') == '!'


@pytest.mark.level(4)
def test_vyhodnot_hru():
    """Hra neskončila"""
    from piskvorky import vyhodnot
    assert vyhodnot('xx----------------oo') == '-'
    assert vyhodnot('-xoxoxoxoxoxoxoxoxox') == '-'
    assert vyhodnot('-xooxxooxxooxxooxxoo') == '-'
    assert vyhodnot('xoxoxoxoxoxoxoxoxox-') == '-'
    assert vyhodnot('xooxxooxxooxxooxxoo-') == '-'
    assert vyhodnot('oxoxoxoxo-oxoxoxoxox') == '-'
    assert vyhodnot('xxooxxoox-ooxxooxxoo') == '-'


@pytest.mark.level(10)
def test_import_tah():
    """Funkce util.tah se dá naimportovat"""
    from util import tah


@pytest.mark.level(11)
def test_tah_x():
    """Pozitivní test funkce `tah` se symbolem 'x'"""
    from util import tah
    assert tah("--------------------", 0, 'x') == 'x-------------------'
    assert tah("--------------------", 10, 'x') == '----------x---------'
    assert tah("--------------------", 19, 'x') == '-------------------x'
    assert tah("o-ox----------------", 1, 'x') == 'oxox----------------'


@pytest.mark.level(11)
def test_tah_o():
    """Pozitivní test funkce `tah` se symbolem 'o'"""
    from util import tah
    assert tah("--------------------", 0, 'o') == 'o-------------------'
    assert tah("--------------------", 10, 'o') == '----------o---------'
    assert tah("--------------------", 19, 'o') == '-------------------o'
    assert tah("x-xo----------------", 1, 'o') == 'xoxo----------------'


@pytest.mark.level(20)
def test_tah_velka_pozice():
    """Tah na pozici co není v poli by měl skončit chybou ValueError"""
    from util import tah
    with pytest.raises(ValueError):
        tah("--------------------", 20, 'x')


@pytest.mark.level(21)
def test_tah_zaporna_pozice():
    """Tah na zápornou pozici by měl skončit chybou ValueError"""
    from util import tah
    with pytest.raises(ValueError):
        tah("--------------------", -1, 'x')


@pytest.mark.level(22)
def test_tah_obsazeno():
    """Tah na obsazené políčko by měl skončit chybou ValueError"""
    from util import tah
    with pytest.raises(ValueError):
        tah("o-------------------", 0, 'o')
    with pytest.raises(ValueError):
        tah("----------x---------", 10, 'o')


@pytest.mark.level(23)
def test_tah_spatny_symbol():
    """Tah s jiným symbolem než 'o' a 'x' by měl skončit chybou ValueError"""
    from util import tah
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'řeřicha')
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'm')
    with pytest.raises(ValueError):
        tah("--------------------", 2, '')


@pytest.mark.level(24)
def test_tah_mala_pismena():
    """Symboly 'o' a 'x' musí být malým písmenem"""
    from util import tah
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'O')
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'X')


@pytest.mark.level(24)
def test_tah_spatny_symbol_ox():
    """Tah s více symboly najednou by měl skončit chybou ValueError"""
    from util import tah
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'xo')
    with pytest.raises(ValueError):
        tah("--------------------", 2, 'ox')


@pytest.mark.level(30)
def test_import_tah_hrace():
    from piskvorky import tah_hrace


@pytest.mark.level(31)
def test_tah_hrace_x_0(podstrc_vstup):
    """Tah hráče: X na pozici 0 na prázdné pole"""
    from piskvorky import tah_hrace
    podstrc_vstup('0')
    assert tah_hrace('--------------------', 'x') == 'x-------------------'


@pytest.mark.level(31)
def test_tah_hrace_o_19(podstrc_vstup):
    """Tah hráče: O na pozici 19 na prázdné pole"""
    from piskvorky import tah_hrace
    podstrc_vstup('19')
    assert tah_hrace('--------------------', 'o') == '-------------------o'


@pytest.mark.level(32)
def test_tah_hrace_necislo(podstrc_vstup):
    """Tah hráče: odpověď 'řeřicha' není uznána, zeptá se znova"""
    from piskvorky import tah_hrace
    podstrc_vstup('řeřicha', '2')
    assert tah_hrace('--------------------', 'o') == '--o-----------------'


@pytest.mark.level(33)
def test_tah_hrace_obsazeno(podstrc_vstup):
    """Tah hráče: plné pole není uznáno, zeptá se znova"""
    from piskvorky import tah_hrace
    podstrc_vstup('0', '1')
    assert tah_hrace('x-------------------', 'o') == 'xo------------------'


@pytest.mark.level(34)
def test_tah_hrace_ukazka(podstrc_vstup):
    """Tah hráče: test ukázky ze zadání"""
    from piskvorky import tah_hrace
    podstrc_vstup('nevím', '0', '-1', '151', '2')
    assert tah_hrace('o-------------------', 'x') == 'o-x-----------------'


@pytest.mark.level(40)
def test_import_tah_pocitace():
    from ai import tah_pocitace


@pytest.mark.level(41)
def test_tah_pocitace_prazdne():
    """Tah počítače na prázdné pole"""
    from ai import tah_pocitace
    for symbol in 'ox':
        result = tah_pocitace('-' * 20, symbol)
        assert len(result) == 20, result + ': Špatná délka pole'
        assert result.count('-') == 19, result + ': Špatný počet pomlček'
        assert result.count(symbol) == 1, result + ': Špatný počet symbolů ' + symbol


@pytest.mark.level(42)
def test_tah_pocitace_plne():
    """Tah počítače na plné pole musí vyvolat výjimku"""
    from ai import tah_pocitace
    for symbol in 'ox':
        with pytest.raises(ValueError):
            result = tah_pocitace('x' * 20, symbol)


@pytest.mark.level(43)
def test_tah_pocitace_skoro_plne():
    """Tah počítače na skoro plné pole (volno uprostřed)"""
    from ai import tah_pocitace
    pole = 'xoxoxoxoxo-xoxoxoxox'
    result = tah_pocitace(pole, 'o')
    # Je jen 1 možnost kam hrát.
    assert result == 'xoxoxoxoxooxoxoxoxox'


@pytest.mark.level(43)
def test_tah_pocitace_skoro_plne_zacatek():
    """Tah počítače na skoro plné pole (volno na začátku)"""
    from ai import tah_pocitace
    pole = '-xoxoxoxoxoxoxoxoxox'
    result = tah_pocitace(pole, 'o')
    # Je jen 1 možnost kam hrát.
    assert result == 'oxoxoxoxoxoxoxoxoxox'


@pytest.mark.level(43)
def test_tah_pocitace_skoro_plne_konec():
    """Tah počítače na skoro plné pole (volno na konci)"""
    from ai import tah_pocitace
    pole = 'oxoxoxoxoxoxoxoxoxo-'
    result = tah_pocitace(pole, 'x')
    # Je jen 1 možnost kam hrát.
    assert result == 'oxoxoxoxoxoxoxoxoxox'

@pytest.mark.level(43)
def test_tah_pocitace_skoro_plne_konec2():
    """Tah počítače na skoro plné pole (2× volno na konci)"""
    from ai import tah_pocitace
    pole = 'xooxxooxoxoxoxooxx--'
    result = tah_pocitace(pole, 'x')
    assert len(result) == 20, result + ': Špatná délka pole'
    assert result.count('x') == 10, result + ': Špatný počet symbolů x'
    assert result.count('o') == 9, result + ': Špatný počet symbolů o'


@pytest.fixture
def podstrc_vstup(monkeypatch):
    """Podstrčí funkci input daný vstup, tak jako by ho zadal uživatel."""
    # Tohle je trochu pokročilá testovací magie.
    # Viz pokročilý kurz: https://naucse.python.cz/course/mi-pyt/intro/testing/
    vstup = []
    def _podstrc(*args):
        vstup.extend(args)
    def podstrceny_input(otazka):
        assert vstup != [], 'Program by neměl pokládat další otázku'
        odpoved = vstup.pop(0)
        print(otazka + odpoved)
        return odpoved
    monkeypatch.setattr(builtins, 'input', podstrceny_input)
    yield _podstrc
    # Kontrola, že všechno ze vstupu bylo přečteno:
    assert vstup == [], 'Nepřečtené odpovědi'
