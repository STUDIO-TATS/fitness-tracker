import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

export default function PrivacyScreen() {
  const navigation = useNavigation();

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.purple[600]} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>プライバシーポリシー</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>最終更新日: 2024年12月1日</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.introText}>
            フィットネストラッカー株式会社（以下「当社」といいます。）は、本ウェブサイト上で提供するサービス（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第1条（個人情報）</Text>
          <Text style={styles.sectionText}>
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第2条（個人情報の収集方法）</Text>
          <Text style={styles.sectionText}>
            当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号、運転免許証番号などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下「提携先」といいます。）などから収集することがあります。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第3条（個人情報を収集・利用する目的）</Text>
          <Text style={styles.sectionText}>
            当社が個人情報を収集・利用する目的は、以下のとおりです。
          </Text>
          <Text style={styles.listItem}>• 当社サービスの提供・運営のため</Text>
          <Text style={styles.listItem}>• ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</Text>
          <Text style={styles.listItem}>• ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</Text>
          <Text style={styles.listItem}>• メンテナンス、重要なお知らせなど必要に応じたご連絡のため</Text>
          <Text style={styles.listItem}>• 利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</Text>
          <Text style={styles.listItem}>• ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</Text>
          <Text style={styles.listItem}>• 有料サービスにおいて、ユーザーに利用料金を請求するため</Text>
          <Text style={styles.listItem}>• 上記の利用目的に付随する目的</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第4条（利用目的の変更）</Text>
          <Text style={styles.sectionText}>
            当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
          </Text>
          <Text style={styles.sectionText}>
            利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第5条（個人情報の第三者提供）</Text>
          <Text style={styles.sectionText}>
            当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
          </Text>
          <Text style={styles.listItem}>• 人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</Text>
          <Text style={styles.listItem}>• 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</Text>
          <Text style={styles.listItem}>• 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</Text>
          <Text style={styles.listItem}>• 予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第6条（個人情報の開示）</Text>
          <Text style={styles.sectionText}>
            当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1,000円の手数料を申し受けます。
          </Text>
          <Text style={styles.listItem}>• 本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</Text>
          <Text style={styles.listItem}>• 当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</Text>
          <Text style={styles.listItem}>• その他法令に違反することとなる場合</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第7条（個人情報の訂正および削除）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます。）を請求することができます。
          </Text>
          <Text style={styles.sectionText}>
            当社は、ユーザーから前項の請求を受けてその請求に理由があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第8条（個人情報の利用停止等）</Text>
          <Text style={styles.sectionText}>
            当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。
          </Text>
          <Text style={styles.sectionText}>
            前項の調査結果に基づき、その請求に理由があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第9条（プライバシーポリシーの変更）</Text>
          <Text style={styles.sectionText}>
            本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
          </Text>
          <Text style={styles.sectionText}>
            当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第10条（お問い合わせ窓口）</Text>
          <Text style={styles.sectionText}>
            本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>住所：東京都渋谷区渋谷1-1-1</Text>
            <Text style={styles.contactText}>社名：フィットネストラッカー株式会社</Text>
            <Text style={styles.contactText}>担当部署：個人情報保護担当</Text>
            <Text style={styles.contactText}>メールアドレス：privacy@fitnesstracker.co.jp</Text>
            <Text style={styles.contactText}>電話番号：03-1234-5678</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第11条（Cookie等の取扱い）</Text>
          <Text style={styles.sectionText}>
            当社は、ユーザーによる本サービスの利用状況を分析し、サービス向上を図るために、Cookie、ウェブビーコン、その他の技術を使用することがあります。これらの技術により収集される情報は、個人を特定できない統計的な情報として利用され、個人情報とは区別して管理されます。
          </Text>
          <Text style={styles.sectionText}>
            ユーザーは、ブラウザの設定によりCookieを無効にすることができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第12条（アクセス解析ツール）</Text>
          <Text style={styles.sectionText}>
            当社は、本サービスの利用状況を把握するために、Google Analyticsなどのアクセス解析ツールを使用しています。これらのツールは、Cookieを使用してユーザーの行動を分析しますが、個人を特定する情報は含まれません。
          </Text>
          <Text style={styles.sectionText}>
            Cookieによる情報収集を拒否する場合は、ブラウザの設定で無効にできます。Google Analyticsについては、Google社のオプトアウトアドオンを利用することで無効にできます。
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>以上</Text>
          <Text style={styles.companyInfo}>フィットネストラッカー株式会社</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  lastUpdated: {
    ...typography.small,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  introText: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 22,
    textAlign: 'justify',
  },
  sectionTitle: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  sectionText: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  listItem: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  contactInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  contactText: {
    ...typography.small,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  footer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  companyInfo: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: 'bold',
    textAlign: 'center',
  },
});