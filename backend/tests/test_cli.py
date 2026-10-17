from backend.main import ler_numero, main
from backend.utils import calcular_margem_seguranca, calcular_potencial_valorizacao
import pytest


def test_legacy_helpers_avoid_invalid_comparison():
    assert calcular_margem_seguranca(0, 5) is None
    assert calcular_margem_seguranca(-10, 5) is None
    assert calcular_potencial_valorizacao(20, 0) is None
    assert calcular_margem_seguranca(100, 80) == pytest.approx(.2)


def test_cli_number_format(monkeypatch):
    monkeypatch.setattr('builtins.input', lambda _: '1.234,56')
    assert ler_numero('') == 1234.56


def test_cli_manual_and_report_safe_path(monkeypatch, tmp_path, capsys):
    monkeypatch.chdir(tmp_path)
    values = iter(['2', '../Teste/empresa', '1000', '0', '0', '100', '', '5', '12', '5', '3', 's'])
    monkeypatch.setattr('builtins.input', lambda _: next(values))
    main()
    output = capsys.readouterr().out
    assert 'Relatório gerado:' in output
    files = list(tmp_path.glob('relatorio_*.txt'))
    assert len(files) == 1
    assert 'Sem estimativa positiva' not in files[0].read_text()
    assert 'Preço de referência: —' in files[0].read_text()
