import React, { Component } from "react";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery, parse } from "graphql";

import { makeDefaultArg, getDefaultScalarArgValue } from "./CustomArgs";

import "graphiql/graphiql.css";
import "./App.css";

import ColorSchemeToggle from "./ColorSchemeToggle";

const fetcher = (params) => {
    return fetch(
        "https://serve.onegraph.com/dynamic?app_id=bc178799-292e-49df-8016-223abf5a07cb",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        }
    )
        .then(function (response) {
            return response.text();
        })
        .then(function (responseBody) {
            try {
                return JSON.parse(responseBody);
            } catch (e) {
                return responseBody;
            }
        });
}

const DEFAULT_QUERY = `# shift-option/alt-click on a query below to jump to it in the explorer
# option/alt-click on a field in the explorer to select all subfields
query npmPackage {
  npm {
    package(name: "onegraph-apollo-client") {
      name
      homepage
      downloads {
        lastMonth {
          count
        }
      }
    }
  }
}
`;

class App extends Component {
    _graphiql;
    state = { schema: null, query: DEFAULT_QUERY, explorerIsOpen: true };

    componentDidMount() {
        fetcher({
            query: getIntrospectionQuery(),
        }).then((result) => {
            const editor = this._graphiql.getQueryEditor();
            editor.setOption("extraKeys", {
                ...(editor.options.extraKeys || {}),
                "Shift-Alt-LeftClick": this._handleInspectOperation,
            });

            console.log(result.data);

            this.setState({ schema: buildClientSchema(result.data) });
        });
    }

    _handleInspectOperation = (
        cm,
        mousePos
    ) => {
        const parsedQuery = parse(this.state.query || "");

        if (!parsedQuery) {
            console.error("Couldn't parse query document");
            return null;
        }

        var token = cm.getTokenAt(mousePos);
        var start = { line: mousePos.line, ch: token.start };
        var end = { line: mousePos.line, ch: token.end };
        var relevantMousePos = {
            start: cm.indexFromPos(start),
            end: cm.indexFromPos(end),
        };

        var position = relevantMousePos;

        var def = parsedQuery.definitions.find((definition) => {
            if (!definition.loc) {
                console.log("Missing location information for definition");
                return false;
            }

            const { start, end } = definition.loc;
            return start <= position.start && end >= position.end;
        });

        if (!def) {
            console.error(
                "Unable to find definition corresponding to mouse position"
            );
            return null;
        }

        var operationKind =
            def.kind === "OperationDefinition"
                ? def.operation
                : def.kind === "FragmentDefinition"
                    ? "fragment"
                    : "unknown";

        var operationName =
            def.kind === "OperationDefinition" && !!def.name
                ? def.name.value
                : def.kind === "FragmentDefinition" && !!def.name
                    ? def.name.value
                    : "unknown";

        var selector = `.graphiql-explorer-root #${operationKind}-${operationName}`;

        var el = document.querySelector(selector);
        el && el.scrollIntoView();
    }

  render() {
    const { query, schema } = this.state;

    return (
        <div className="graphiql-container">
          <GraphiQLExplorer
              schema={schema}
              query={query}
              onEdit={this._handleEditQuery}
              onRunOperation={(operationName) =>
                  this._graphiql.handleRunQuery(operationName)
              }
              explorerIsOpen={this.state.explorerIsOpen}
              onToggleExplorer={this._handleToggleExplorer}
              getDefaultScalarArgValue={getDefaultScalarArgValue}
              makeDefaultArg={makeDefaultArg}
          />
          <GraphiQL
              ref={(ref) => (this._graphiql = ref)}
              fetcher={fetcher}
              schema={schema}
              query={query}
              onEditQuery={this._handleEditQuery}
              editorTheme={"dracula"}
          >
            <GraphiQL.Toolbar>
              <GraphiQL.Button
                  onClick={() => this._graphiql.handlePrettifyQuery()}
                  label="Prettify"
                  title="Prettify Query (Shift-Ctrl-P)"
              />
              <GraphiQL.Button
                  onClick={() => this._graphiql.handleToggleHistory()}
                  label="History"
                  title="Show History"
              />
              <GraphiQL.Button
                  onClick={this._handleToggleExplorer}
                  label="Explorer"
                  title="Toggle Explorer"
              />
              <ColorSchemeToggle />
            </GraphiQL.Toolbar>
          </GraphiQL>
        </div>
    );
  }
}

export default App;
