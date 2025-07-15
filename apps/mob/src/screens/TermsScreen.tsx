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

export default function TermsScreen() {
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
        <Text style={styles.screenTitle}>利用規約</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>最終更新日: 2024年12月1日</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第1条（適用）</Text>
          <Text style={styles.sectionText}>
            この利用規約（以下「本規約」といいます。）は、フィットネストラッカー（以下「当社」といいます。）がこのモバイルアプリケーション（以下「本サービス」といいます。）上で提供するサービスの利用条件を定めるものです。登録ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第2条（利用登録）</Text>
          <Text style={styles.sectionText}>
            本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
          </Text>
          <Text style={styles.sectionText}>
            当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
          </Text>
          <Text style={styles.listItem}>• 利用登録の申請に際して虚偽の事項を届け出た場合</Text>
          <Text style={styles.listItem}>• 本規約に違反したことがある者からの申請である場合</Text>
          <Text style={styles.listItem}>• その他、当社が利用登録を相当でないと判断した場合</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第3条（ユーザーIDおよびパスワードの管理）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
          </Text>
          <Text style={styles.sectionText}>
            ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。当社は、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第4条（利用料金および支払方法）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、本サービスの有料部分の対価として、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。
          </Text>
          <Text style={styles.sectionText}>
            ユーザーが利用料金の支払を遅滞した場合には、ユーザーは年14.6％の割合による遅延損害金を支払うものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第5条（禁止事項）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </Text>
          <Text style={styles.listItem}>• 法令または公序良俗に違反する行為</Text>
          <Text style={styles.listItem}>• 犯罪行為に関連する行為</Text>
          <Text style={styles.listItem}>• 当社、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</Text>
          <Text style={styles.listItem}>• 当社のサービスの運営を妨害するおそれのある行為</Text>
          <Text style={styles.listItem}>• 他のユーザーに関する個人情報等を収集または蓄積する行為</Text>
          <Text style={styles.listItem}>• 不正アクセスをし、またはこれを試みる行為</Text>
          <Text style={styles.listItem}>• 他のユーザーに成りすます行為</Text>
          <Text style={styles.listItem}>• 当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</Text>
          <Text style={styles.listItem}>• その他、当社が不適切と判断する行為</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第6条（本サービスの提供の停止等）</Text>
          <Text style={styles.sectionText}>
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </Text>
          <Text style={styles.listItem}>• 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</Text>
          <Text style={styles.listItem}>• 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</Text>
          <Text style={styles.listItem}>• コンピュータまたは通信回線等が事故により停止した場合</Text>
          <Text style={styles.listItem}>• その他、当社が本サービスの提供が困難と判断した場合</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第7条（著作権）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報に関してのみ、本サービスを利用し、投稿ないしアップロードすることができるものとします。
          </Text>
          <Text style={styles.sectionText}>
            ユーザーが本サービスを利用して投稿ないしアップロードした文章、画像、映像等の著作権については、当該ユーザーその他既存の権利者に留保されるものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第8条（利用制限および登録抹消）</Text>
          <Text style={styles.sectionText}>
            当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、投稿データを削除し、ユーザーに対して本サービスの全部もしくは一部の利用を制限しまたはユーザーとしての登録を抹消することができるものとします。
          </Text>
          <Text style={styles.listItem}>• 本規約のいずれかの条項に違反した場合</Text>
          <Text style={styles.listItem}>• 登録事項に虚偽の事実があることが判明した場合</Text>
          <Text style={styles.listItem}>• 料金等の支払債務の不履行があった場合</Text>
          <Text style={styles.listItem}>• 当社からの連絡に対し、一定期間返答がない場合</Text>
          <Text style={styles.listItem}>• 本サービスについて、最終の利用から一定期間利用がない場合</Text>
          <Text style={styles.listItem}>• その他、当社が本サービスの利用を適当でないと判断した場合</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第9条（免責事項）</Text>
          <Text style={styles.sectionText}>
            当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
          </Text>
          <Text style={styles.sectionText}>
            当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第10条（サービス内容の変更等）</Text>
          <Text style={styles.sectionText}>
            当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第11条（利用規約の変更）</Text>
          <Text style={styles.sectionText}>
            当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第12条（個人情報の取扱い）</Text>
          <Text style={styles.sectionText}>
            当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第13条（通知または連絡）</Text>
          <Text style={styles.sectionText}>
            ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第14条（権利義務の譲渡の禁止）</Text>
          <Text style={styles.sectionText}>
            ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第15条（準拠法・裁判管轄）</Text>
          <Text style={styles.sectionText}>
            本規約の解釈にあたっては、日本法を準拠法とします。
          </Text>
          <Text style={styles.sectionText}>
            本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
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