import { useEffect, useState } from 'react';
import {
    ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays,
    Check, CircleHelp, CreditCard, Ellipsis, Grid2X2, ListFilter,
    LockKeyhole, LogOut, Menu, Moon, Plus, Search, Settings2, Sparkles,
    Tag, TrendingDown, TrendingUp, Wallet, X,
} from 'lucide-react';

const TOKEN_KEY = 'conta-clara-token';
const emptySummary = { total_revenue: '0.00', total_expenses: '0.00', balance: '0.00' };

function apiRequest(path, token, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body) headers.set('Content-Type', 'application/json');

    return fetch(`/api${path}`, { ...options, headers }).then(async (response) => {
        const data = response.status === 204 ? null : await response.json().catch(() => null);
        if (!response.ok) {
            const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : null;
            const error = new Error(validationMessage || data?.message || 'Não foi possível concluir a solicitação.');
            error.status = response.status;
            throw error;
        }
        return data;
    });
}

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function periodQuery(period, page = 1) {
    const [year, month] = period.split('-');
    return `?month=${Number(month)}&year=${year}&page=${page}`;
}

function periodLabel(period) {
    const [year, month] = period.split('-').map(Number);
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        .format(new Date(Date.UTC(year, month - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function money(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function dateLabel(value) {
    return value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(value)) : '—';
}

function initials(name = 'Conta Clara') {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function todayInput() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function AuthScreen({ onAuthenticated, darkMode, onToggleTheme }) {
    const [mode, setMode] = useState('login');
    const [fields, setFields] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const result = await apiRequest(`/${mode === 'login' ? 'login' : 'register'}`, null, {
                method: 'POST', body: JSON.stringify(fields),
            });
            onAuthenticated(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth-screen">
            <section className="auth-story">
                <a className="brand brand-light" href="/" aria-label="Conta Clara, início"><span className="brand-mark"><Wallet size={19} /></span><span>conta<span className="brand-accent">clara</span></span></a>
                <div className="story-copy">
                    <span className="eyebrow"><Sparkles size={14} /> FINANÇAS DO SEU JEITO</span>
                    <h1>Clareza para escolher o próximo passo.</h1>
                    <p>Um lugar tranquilo para acompanhar o que entra, o que sai e o que fica.</p>
                    <div className="story-stamp"><span className="stamp-ring">+</span><span>seu mês, em equilíbrio</span></div>
                </div>
                <span className="story-footnote">Pessoal, simples, seu.</span>
            </section>
            <section className="auth-panel">
                <div className="auth-panel-top"><span>FINANÇAS PESSOAIS</span><div className="auth-header-actions"><button className="icon-button theme-toggle" type="button" aria-label={darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={darkMode} title={darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={onToggleTheme}><Moon size={18} /></button><span className="secure-label"><LockKeyhole size={13} /> Acesso protegido</span></div></div>
                <div className="auth-form-wrap">
                    <div className="auth-heading"><span className="auth-kicker">{mode === 'login' ? 'BOM TER VOCÊ DE VOLTA' : 'COMECE POR AQUI'}</span><h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2><p>{mode === 'login' ? 'Use seus dados para continuar.' : 'Leva só um minuto para começar.'}</p></div>
                    <form className="form-stack" onSubmit={submit}>
                        {mode === 'register' && <label className="field"><span>Nome</span><input autoComplete="name" required value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} placeholder="Como podemos te chamar?" /></label>}
                        <label className="field"><span>E-mail</span><input autoComplete="email" type="email" required value={fields.email} onChange={(event) => setFields({ ...fields, email: event.target.value })} placeholder="voce@email.com" /></label>
                        <label className="field"><span>Senha</span><input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" minLength={mode === 'register' ? 8 : undefined} required value={fields.password} onChange={(event) => setFields({ ...fields, password: event.target.value })} placeholder={mode === 'register' ? 'Pelo menos 8 caracteres' : 'Sua senha'} /></label>
                        {error && <p className="form-error" role="alert">{error}</p>}
                        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Aguarde…' : mode === 'login' ? 'Entrar na conta' : 'Criar conta'}<ArrowRight size={17} /></button>
                    </form>
                    <p className="auth-switch">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}{' '}<button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Criar conta' : 'Fazer login'}</button></p>
                </div>
                <div className="auth-footer"><span>CONTA CLARA</span><span>FEITO PARA A VIDA REAL</span></div>
            </section>
        </main>
    );
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
    useEffect(() => {
        function onKeyDown(event) { if (event.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-heading"><div><span className="modal-kicker">CONTA CLARA</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button modal-close" type="button" aria-label="Fechar" onClick={onClose}><X size={19} /></button></div>
                {children}
            </section>
        </div>
    );
}

function TransactionModal({ transaction, categories, token, onClose, onSaved }) {
    const [fields, setFields] = useState({
        description: transaction?.description || '', amount: transaction?.amount || '',
        date: transaction?.date?.slice(0, 10) || todayInput(), type: transaction?.type || 'expense',
        category_id: transaction?.category_id || categories[0]?.id || '',
    });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            await apiRequest(transaction ? `/transactions/${transaction.id}` : '/transactions', token, {
                method: transaction ? 'PUT' : 'POST', body: JSON.stringify({ ...fields, amount: String(fields.amount) }),
            });
            onSaved();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal title={transaction ? 'Editar lançamento' : 'Novo lançamento'} subtitle="Preencha os dados do movimento." onClose={onClose}>
            <form className="form-stack modal-form" onSubmit={submit}>
                <div className="segmented-control" aria-label="Tipo de lançamento">
                    <button className={fields.type === 'expense' ? 'selected expense-choice' : ''} type="button" onClick={() => setFields({ ...fields, type: 'expense' })}><ArrowUpRight size={16} /> Despesa</button>
                    <button className={fields.type === 'revenue' ? 'selected revenue-choice' : ''} type="button" onClick={() => setFields({ ...fields, type: 'revenue' })}><ArrowDownLeft size={16} /> Receita</button>
                </div>
                <label className="field"><span>Descrição</span><input required maxLength="255" value={fields.description} onChange={(event) => setFields({ ...fields, description: event.target.value })} placeholder="Ex.: Mercado da semana" /></label>
                <div className="field-row">
                    <label className="field"><span>Valor</span><div className="money-input"><span>R$</span><input required type="number" min="0.01" step="0.01" value={fields.amount} onChange={(event) => setFields({ ...fields, amount: event.target.value })} placeholder="0,00" /></div></label>
                    <label className="field"><span>Data</span><input required type="date" value={fields.date} onChange={(event) => setFields({ ...fields, date: event.target.value })} /></label>
                </div>
                <label className="field"><span>Categoria</span><select required value={fields.category_id} onChange={(event) => setFields({ ...fields, category_id: event.target.value })}><option value="" disabled>Selecione uma categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={busy || categories.length === 0}>{busy ? 'Salvando…' : transaction ? 'Salvar alterações' : 'Adicionar lançamento'}<ArrowRight size={16} /></button></div>
                {categories.length === 0 && <p className="form-note">Cadastre uma categoria antes de adicionar um lançamento.</p>}
            </form>
        </Modal>
    );
}

function CategoryModal({ categories, token, onClose, onSaved }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            await apiRequest('/categories', token, { method: 'POST', body: JSON.stringify({ name }) });
            setName('');
            onSaved();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal title="Suas categorias" subtitle="Organize os lançamentos do seu jeito." onClose={onClose} wide>
            <form className="category-create" onSubmit={submit}><label className="field"><span>Nova categoria</span><input required minLength="2" maxLength="255" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Casa, saúde, lazer" /></label><button className="button button-primary" disabled={busy}>{busy ? 'Adicionando…' : 'Adicionar'}<Plus size={16} /></button></form>
            {error && <p className="form-error category-error" role="alert">{error}</p>}
            <div className="category-list">{categories.length ? categories.map((category, index) => <div className="category-row" key={category.id}><span className={`category-swatch swatch-${index % 5}`}><Tag size={15} /></span><span>{category.name}</span><Check size={15} className="category-check" /></div>) : <p className="empty-copy">Nenhuma categoria cadastrada ainda.</p>}</div>
        </Modal>
    );
}

function SummaryCard({ label, value, variant, icon: Icon, hint, period }) {
    return (
        <article className={`summary-card summary-${variant}`}>
            <div className="summary-topline"><span className="summary-icon"><Icon size={17} /></span><span>{hint}</span></div>
            <span className="summary-label">{label}</span><strong>{money(value)}</strong>
            <div className="summary-bottomline"><span className="summary-dot" /> <span>{period}</span></div>
        </article>
    );
}

function TransactionsTable({ items, categories, onEdit, onDelete }) {
    const [search, setSearch] = useState('');
    const phrase = search.trim().toLocaleLowerCase('pt-BR');
    const visibleItems = items.filter((item) => `${item.description} ${item.category?.name || ''}`.toLocaleLowerCase('pt-BR').includes(phrase));

    return (
        <>
            <div className="table-tools"><label className="search-box"><Search size={16} /><input aria-label="Buscar lançamentos" placeholder="Buscar lançamento" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span className="table-count"><ListFilter size={15} /> {visibleItems.length} nesta página</span></div>
            <div className="table-scroll"><table className="transaction-table"><thead><tr><th>LANÇAMENTO</th><th>DATA</th><th>CATEGORIA</th><th>TIPO</th><th className="align-right">VALOR</th><th><span className="visually-hidden">Ações</span></th></tr></thead>
                <tbody>{visibleItems.map((item, index) => {
                    const revenue = item.type === 'revenue';
                    return <tr key={item.id} style={{ '--row-index': index }}><td><span className={`transaction-glyph ${revenue ? 'glyph-revenue' : 'glyph-expense'}`}>{revenue ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><span className="transaction-description">{item.description}</span></td><td className="date-cell">{dateLabel(item.date)}</td><td><span className="category-pill">{item.category?.name || categories.find((category) => category.id === item.category_id)?.name || 'Sem categoria'}</span></td><td><span className={`type-label ${revenue ? 'type-revenue' : 'type-expense'}`}>{revenue ? 'Receita' : 'Despesa'}</span></td><td className={`amount-cell align-right ${revenue ? 'amount-positive' : ''}`}>{revenue ? '+' : '−'} {money(item.amount)}</td><td><div className="row-actions"><button className="icon-button" type="button" title="Editar lançamento" aria-label={`Editar ${item.description}`} onClick={() => onEdit(item)}><Settings2 size={15} /></button><button className="icon-button danger-icon" type="button" title="Excluir lançamento" aria-label={`Excluir ${item.description}`} onClick={() => onDelete(item)}><X size={16} /></button></div></td></tr>;
                })}{visibleItems.length === 0 && <tr><td colSpan="6"><div className="table-empty"><span className="empty-icon"><CreditCard size={20} /></span><strong>{phrase ? 'Nenhum resultado encontrado' : 'Seu mês começa por aqui'}</strong><span>{phrase ? 'Tente outra descrição ou categoria.' : 'Adicione seu primeiro lançamento para ver tudo organizado.'}</span></div></td></tr>}</tbody>
            </table></div>
        </>
    );
}

function App() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('overview');
    const [period, setPeriod] = useState(currentMonth);
    const [pageNumber, setPageNumber] = useState(1);
    const [categories, setCategories] = useState([]);
    const [transactionPage, setTransactionPage] = useState({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 15 });
    const [summary, setSummary] = useState(emptySummary);
    const [busy, setBusy] = useState(false);
    const [pageError, setPageError] = useState('');
    const [transactionModal, setTransactionModal] = useState(null);
    const [categoryModal, setCategoryModal] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('conta-clara-theme') === 'dark');

    useEffect(() => {
        const theme = darkMode ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('conta-clara-theme', theme);
    }, [darkMode]);

    useEffect(() => {
        if (!token) return undefined;
        let active = true;
        apiRequest('/user', token).then((result) => { if (active) setUser(result); }).catch((error) => {
            if (!active) return;
            if (error.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            } else setPageError(error.message);
        });
        return () => { active = false; };
    }, [token]);

    useEffect(() => {
        if (!token) return undefined;
        let active = true;
        setBusy(true);
        setPageError('');
        Promise.all([
            apiRequest('/categories', token),
            apiRequest(`/transactions${periodQuery(period, pageNumber)}`, token),
            apiRequest(`/dashboard/summary${periodQuery(period)}`, token),
        ]).then(([categoryResult, transactions, totals]) => {
            if (!active) return;
            setCategories(categoryResult.categories || []);
            setTransactionPage(transactions);
            setSummary(totals);
        }).catch((error) => {
            if (!active) return;
            setPageError(error.message);
            if (error.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            }
        }).finally(() => { if (active) setBusy(false); });
        return () => { active = false; };
    }, [token, period, pageNumber, reloadKey]);

    function authenticated(result) {
        localStorage.setItem(TOKEN_KEY, result.token);
        setUser(result.user);
        setToken(result.token);
    }

    function signOut() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setCategories([]);
        setTransactionPage({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 15 });
    }

    function refreshData() {
        setTransactionModal(null);
        setCategoryModal(false);
        setReloadKey((value) => value + 1);
    }

    async function deleteTransaction(transaction) {
        if (!window.confirm(`Excluir “${transaction.description}”?`)) return;
        try {
            await apiRequest(`/transactions/${transaction.id}`, token, { method: 'DELETE' });
            if (transactionPage.data.length === 1 && pageNumber > 1) setPageNumber((value) => value - 1);
            else setReloadKey((value) => value + 1);
        } catch (error) { setPageError(error.message); }
    }

    if (!token) return <AuthScreen onAuthenticated={authenticated} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />;

    const navigation = [
        { id: 'overview', label: 'Visão geral', icon: Grid2X2 },
        { id: 'transactions', label: 'Lançamentos', icon: CreditCard },
        { id: 'categories', label: 'Categorias', icon: Tag },
    ];

    return (
        <div className="app-shell">
            <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
                <div className="sidebar-top"><a className="brand" href="/" aria-label="Conta Clara, início"><span className="brand-mark"><Wallet size={19} /></span><span>conta<span className="brand-accent">clara</span></span></a><span className="workspace-label">ESPAÇO PESSOAL</span></div>
                <nav className="primary-nav" aria-label="Navegação principal"><span className="nav-caption">MENU</span>{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${page === id ? 'nav-active' : ''}`} type="button" onClick={() => { setPage(id); setMobileMenu(false); }}><Icon size={18} /><span>{label}</span>{page === id && <span className="nav-indicator" />}</button>)}</nav>
                <div className="sidebar-bottom"><div className="help-note"><span className="help-note-icon"><CircleHelp size={16} /></span><span><strong>Precisa de ajuda?</strong><small>Estamos por aqui.</small></span><ArrowRight size={14} /></div><div className="profile-row"><span className="avatar">{initials(user?.name)}</span><span className="profile-copy"><strong>{user?.name || 'Minha conta'}</strong><small>{user?.email || 'Finanças pessoais'}</small></span><button className="icon-button logout-button" type="button" title="Sair" aria-label="Sair da conta" onClick={signOut}><LogOut size={16} /></button></div></div>
            </aside>

            <main className="main-stage">
                <header className="topbar"><button className="mobile-menu-button icon-button" type="button" aria-label="Abrir menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button><div className="breadcrumb"><span>Meu espaço</span><span className="breadcrumb-slash">/</span><strong>{navigation.find((item) => item.id === page)?.label}</strong></div><div className="topbar-right"><button className="icon-button theme-toggle" type="button" aria-label={darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={darkMode} title={darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={() => setDarkMode((value) => !value)}><Moon size={18} /></button><span className="today-label"><span className="online-dot" /> Seus dados estão atualizados</span><span className="topbar-avatar">{initials(user?.name)}</span></div></header>
                <div className="page-content">
                    <div className="page-heading"><div><span className="page-overline">SEU DINHEIRO, EM FOCO</span><h1>{page === 'overview' ? 'Visão geral' : page === 'transactions' ? 'Lançamentos' : 'Categorias'}</h1><p>{page === 'categories' ? 'Organize seus movimentos por assunto.' : `Acompanhe seu movimento financeiro em ${periodLabel(period).toLocaleLowerCase('pt-BR')}.`}</p></div><div className="heading-actions">{page !== 'categories' && <label className="period-select"><CalendarDays size={16} /><input aria-label="Mês de referência" type="month" value={period} onChange={(event) => { setPeriod(event.target.value || currentMonth()); setPageNumber(1); }} /></label>}{page === 'categories' ? <button className="button button-primary" type="button" onClick={() => setCategoryModal(true)}><Plus size={17} /> Nova categoria</button> : <button className="button button-primary" type="button" onClick={() => setTransactionModal({ transaction: null })}><Plus size={17} /> Novo lançamento</button>}</div></div>
                    {pageError && <div className="notice-error" role="alert"><span>{pageError}</span><button className="icon-button" type="button" aria-label="Fechar aviso" onClick={() => setPageError('')}><X size={16} /></button></div>}

                    {page === 'categories' ? <section className="content-panel categories-panel"><div className="section-heading"><div><span className="section-kicker">ORGANIZAÇÃO</span><h2>Suas categorias</h2></div><span className="soft-count">{categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}</span></div>{categories.length ? <div className="category-grid">{categories.map((category, index) => <article className="category-card" key={category.id}><span className={`category-swatch swatch-${index % 5}`}><Tag size={17} /></span><div><strong>{category.name}</strong><span>Categoria pessoal</span></div><Ellipsis size={18} className="category-more" /></article>)}</div> : <div className="table-empty category-empty"><span className="empty-icon"><Tag size={20} /></span><strong>Crie sua primeira categoria</strong><span>Use categorias para identificar cada movimento.</span><button className="button button-soft" type="button" onClick={() => setCategoryModal(true)}><Plus size={16} /> Nova categoria</button></div>}</section> : <>
                        {page === 'overview' && <section className="summary-grid" aria-label="Resumo financeiro"><SummaryCard label="Total de receitas" value={summary.total_revenue} variant="revenue" icon={TrendingUp} hint="ENTRADAS" period={periodLabel(period)} /><SummaryCard label="Total de despesas" value={summary.total_expenses} variant="expense" icon={TrendingDown} hint="SAÍDAS" period={periodLabel(period)} /></section>}
                        <section className="content-panel transactions-panel"><div className="section-heading"><div><span className="section-kicker">MOVIMENTAÇÕES</span><h2>{page === 'overview' ? 'Atividade recente' : 'Todos os lançamentos'}</h2></div><div className="section-actions"><span className="soft-count">{transactionPage.total || 0} no período</span>{page === 'overview' && <button className="text-button" type="button" onClick={() => setPage('transactions')}>Ver todos <ArrowRight size={15} /></button>}</div></div><TransactionsTable items={transactionPage.data || []} categories={categories} onEdit={(transaction) => setTransactionModal({ transaction })} onDelete={deleteTransaction} /><div className="pagination"><span>{busy ? 'Atualizando…' : transactionPage.total ? `Exibindo ${Math.min((pageNumber - 1) * 15 + 1, transactionPage.total)}–${Math.min(pageNumber * 15, transactionPage.total)} de ${transactionPage.total}` : 'Nenhum lançamento no período'}</span><div className="pagination-actions"><button className="icon-button" type="button" aria-label="Página anterior" disabled={pageNumber <= 1 || busy} onClick={() => setPageNumber((value) => Math.max(1, value - 1))}><ArrowLeft size={16} /></button><span className="page-number">{pageNumber} <small>/ {transactionPage.last_page || 1}</small></span><button className="icon-button" type="button" aria-label="Próxima página" disabled={pageNumber >= (transactionPage.last_page || 1) || busy} onClick={() => setPageNumber((value) => value + 1)}><ArrowRight size={16} /></button></div></div></section>
                        {page === 'overview' && <div className="bottom-note"><span className="bottom-note-mark"><Sparkles size={15} /></span><span>Pequenos passos também constroem equilíbrio.</span><span className="bottom-note-period">{periodLabel(period)}</span></div>}
                    </>}
                    <footer className="page-footer"><span>CONTA CLARA <span>·</span> FINANÇAS PESSOAIS</span><span>FEITO PARA A VIDA REAL</span></footer>
                </div>
            </main>
            {transactionModal && <TransactionModal transaction={transactionModal.transaction} categories={categories} token={token} onClose={() => setTransactionModal(null)} onSaved={refreshData} />}
            {categoryModal && <CategoryModal categories={categories} token={token} onClose={() => setCategoryModal(false)} onSaved={refreshData} />}
        </div>
    );
}

export default App;