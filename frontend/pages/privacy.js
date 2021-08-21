import React from 'react'
import Layout from '../components/Layout'
import withData from '../util/withData'

class PrivacyPolicyPage extends React.Component {

  render() {
    return (
      <Layout width={600}>

        <p>
            Vytvořením uživatelského účtu na těchto stránkách udělujete souhlas spolku <a href="https://pyvec.org">Pyvec z.s.</a>, se sídlem:
            <address>
                Impact Hub Praha <br />
                Drtinova 10/557 <br />
                15000 Praha 5, <br />
                IČO: 22746668, <br />
            </address>
            zapsané ve veřejném rejstříku vedeném u Městského soudu v Praze, oddíl B, vložka 24180 (dále jen „Správce“),
            aby ve smyslu zákona č.101/2000 Sb., o ochraně osobních údajů (dále jen „zákon o ochraně osobních údajů“)
            zpracovávala tyto osobní údaje:
            <ul>
                <li>jméno a příjmení, příp. přezdívka (dále <em>jméno</em>)</li>
                <li>e-mailová adresa</li>
            </ul>
        </p>

        <p>
            Ke všem zpracovávaným osobním údajům mají přístup <em>administrátoři</em>,
            vybraní členové spolku Pyvec, z.s.
        </p>

        <p>
            <em>Jméno</em> označuje obsah, který na stránky vložíte (např. zaslaná řešení úloh a komentáře k nim)
            a je vždy u takového obsahu zobrazeno.
            <em> Koučové</em>, dobrovolníci kteří pomáhají s opravou a hodnocením řešení úkolů,
            mají navíc přístup k seznamu jmen všech účastníků kurzu, pro který koučují.
            Koučové nejsou nutně členy spolku Pyvec, z.s.
        </p>
        <p>
            <em>E-mailovou adresu</em> je nutné zpracovat za účelem organizace kurzů a správy vašeho účtu.
            K e-mailové adrese mají přístup pouze <em>administrátoři</em>.
        </p>

        <p>
            Podle zákona o ochraně osobních údajů máte právo:
            <ul>
                <li>vzít souhlas kdykoliv zpět,</li>
                <li>požadovat po nás informaci, jaké vaše osobní údaje zpracováváme, požadovat po nás vysvětlení ohledně zpracování osobních údajů,</li>
                <li>vyžádat si u nás přístup k těmto údajům a tyto nechat aktualizovat nebo opravit,</li>
                <li>požadovat po nás výmaz těchto osobních údajů,</li>
                <li>v případě pochybností o dodržování povinností souvisejících se zpracováním osobních údajů obrátit se na nás nebo na Úřad pro ochranu osobních údajů.</li>
            </ul>
        </p>

      </Layout>
    )
  }
}

export default withData(PrivacyPolicyPage, {
  query: graphql`
    query privacyQuery {
      currentUser {
        ...Layout_currentUser
      }
    }
  `
})
