import * as React from "react";
import { Row, Col } from "reactstrap";
import { History } from 'history';
import { localise } from 'src/modules/shared/services';
import "./content.css";
import { lookupService } from "src/modules/shared/services";
import { helpcentreService } from "../../services/helpcentre.service";
import { LookupItem } from "src/modules/shared/types/dto";

interface Props {
    history: History;
}

export class Content extends React.Component<Props> {
    articleList: LookupItem[] = lookupService.getList("LIST_MOST_SEARCHED_ARTICLES");
    installationGuides: LookupItem[] = lookupService.getList("LIST_CABINET_USER_GUIDES");
    questionList: LookupItem[] = lookupService.getList("LIST_FREQUENTLY_ASKED_QUESTIONS");

    constructor(props: any) {
        super(props);
        this.navigateToContactUs = this.navigateToContactUs.bind(this);
        this.getDownloadUrl = this.getDownloadUrl.bind(this);
    }

    navigateToContactUs() {
        this.props.history.push({
            pathname: `/help/overview/contact_us`
        });
    }

    getDownloadUrl(fileName: string, basePath: string) {
        helpcentreService.getDownloadUrl(fileName, basePath).then((data: string) => {
            window.open(data, "_blank");
        });
    }

    render() {
        return (
            <div className="pl-4 help-centre-content">
                <Row className="pt-4">
                    <Col>
                        <h5 color="primary" className="color-blue"><b>{localise("TEXT_HELP_CENTRE_TITLE")}</b></h5>
                        <p>{localise("TEXT_HELP_CENTRE_REMARK")}</p>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col sm="12" md="12" xl="4">
                        <Row>
                            <Col className="text-center">
                                <i className="fas fa-clipboard-list icon-style color-blue"></i>
                                <h5>{localise("TEXT_HELP_CENTRE_KNOWLEDGE_CATAGORY_TITLE")}</h5>
                                <p>{localise("TEXT_HELP_CENTRE_KNOWLEDGE_CATAGORY_REMARK")}</p>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col className="text-center">
                                <Row>
                                    <Col>
                                        <h5 className="color-blue"><b>{localise("TEXT_MOST_SEARCHED_ARTICLES")}</b></h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-left">
                                        <ul className="space">
                                            {this.articleList.map((lookupItem, index) => {
                                                let lookupItemValue = (lookupItem.value && lookupItem.value.toLowerCase()) || "";
                                                return (
                                                    <li key={lookupItemValue} className="clickable-link" onClick={() => this.getDownloadUrl(lookupItem.value || '', "Articles")}>
                                                        <a>{(index + 1) + " - "}{lookupItem.text && localise(lookupItem.text)}</a></li>
                                                );
                                            })}
                                        </ul>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm="12" md="12" xl="4" className="align-column">
                        <Row>
                            <Col className="text-center">
                                <i className="fas fa-wrench icon-style color-blue"></i>
                                <h5>{localise("TEXT_HELP_CENTRE_INSTALLTION_GUIDE_CATAGORY_TITLE")}</h5>
                                <p>{localise("TEXT_HELP_CENTRE_INSTALLTION_GUIDE_CATAGORY_REMARK")}</p>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col className="text-center">
                                <Row>
                                    <Col>
                                        <h5 className="color-blue"><b>{localise("TEXT_CABINET_USER_GUIDES")}</b></h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-left">
                                        <ul className="space">
                                            {this.installationGuides.map((lookupItem, index) => {
                                                let lookupItemValue = (lookupItem.value && lookupItem.value.toLowerCase()) || "";
                                                return (
                                                    <li key={lookupItemValue} className="clickable-link" onClick={() => this.getDownloadUrl(lookupItem.value || '', "UserGuides")} >
                                                        <a>{(index + 1) + " - "}{lookupItem.text && localise(lookupItem.text)}</a> </li>
                                                );
                                            })}
                                        </ul>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm="12" md="12" xl="4" className="align-column">
                        <Row>
                            <Col className="text-center" onClick={e => this.navigateToContactUs()} >
                                <i className="fas fa-comment-dots icon-style color-blue link"></i>
                                <h5 className="clickable-topic">{localise("TEXT_CONTACT_US")}</h5>
                                <p>{localise("TEXT_HELP_CENTRE_CONTACT_US_CATAGORY_REMARK")}</p>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col className="text-center">
                                <Row>
                                    <Col>
                                        <h5 className="color-blue"><b>{localise("LIST_FREQUENTLY_ASKED_QUESTIONS")}</b></h5>
                                    </Col>     
                                </Row>
                                <Row>
                                    <Col className="text-left">
                                        <ul className="space">
                                            {this.questionList.map((lookupItem, index) => {
                                                let lookupItemValue = (lookupItem.value && lookupItem.value.toLowerCase()) || "";
                                                return (
                                                    <li key={lookupItemValue} className="clickable-link" onClick={() => this.getDownloadUrl(lookupItem.value || '', "Questions")} >
                                                        <a>{(index + 1) + " - "}{lookupItem.text && localise(lookupItem.text)}</a></li>
                                                );
                                            })}
                                        </ul>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}



// WEBPACK FOOTER //
// ./src/modules/helpCentre/components/Content/Content.tsx