package cmd

import (
	"bufio"
	"fmt"
	"os"
	"sort"

	"github.com/NoF0rte/gocdp"
	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
)

// statsCmd represents the totals command
var statsCmd = &cobra.Command{
	Use:   "stats files...",
	Args:  cobra.MinimumNArgs(1),
	Short: "Display stats on results",
	RunE: func(cmd *cobra.Command, args []string) error {
		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		byFile, _ := cmd.Flags().GetBool("by-file")
		if byFile {
			for _, file := range files {
				results, err := gocdp.SmartParseFiles([]string{file})
				if err != nil {
					return err
				}

				fmt.Printf("File: %s\n", file)
				displayStatsTables(results.GroupByStatus())
				fmt.Println()
			}
		} else {
			results, err := gocdp.SmartParseFiles(files)
			if err != nil {
				return err
			}

			displayStatsTables(results.GroupByStatus())
		}

		return nil
	},
}

type stats struct {
	sizes        map[int]int
	contentTypes map[string]int
}

func (s *stats) incSize(size int) {
	s.sizes[size] += 1
}

func (s *stats) incContentType(contentType string) {
	s.contentTypes[contentType] += 1
}

func displayStatsTables(grouped map[int][]gocdp.CDResult) {
	totalsWriter := table.NewWriter()
	totalsWriter.AppendHeader(table.Row{"Status", "Total"})
	// statusWriter.SetTitle("Status Stats")

	statusTables := make(map[int]string)
	var statuses []int
	for status := range grouped {
		statuses = append(statuses, status)
	}
	sort.Ints(statuses)

	for _, status := range statuses {
		results := grouped[status]
		stat := &stats{
			sizes:        make(map[int]int),
			contentTypes: make(map[string]int),
		}

		totalsWriter.AppendRow(table.Row{
			status,
			len(results),
		})

		for _, result := range results {
			stat.incContentType(result.ContentType)
			stat.incSize(result.ContentLength)
		}

		sizeWriter := table.NewWriter()
		// sizeWriter.AppendHeader(table.Row{"Size", "Total"})
		// sizeWriter.SetTitle(fmt.Sprintf("\"%d\" Size Stats", status))
		sizeWriter.SetTitle(fmt.Sprintf("Status: %d", status))

		sizeWriter.AppendRow(table.Row{"SIZE", "TOTAL"})
		sizeWriter.AppendSeparator()
		for size, total := range stat.sizes {
			sizeWriter.AppendRow(table.Row{size, total})
		}
		sizeWriter.AppendSeparator()

		sizeWriter.AppendRow(table.Row{"CONTENT TYPE", "TOTAL"})
		sizeWriter.AppendSeparator()
		for contentType, total := range stat.contentTypes {
			sizeWriter.AppendRow(table.Row{contentType, total})
		}

		statusTables[status] = sizeWriter.Render()

		// contentTypeWriter := table.NewWriter()
		// // contentTypeWriter.AppendHeader(table.Row{"Content Type", "Total"})
		// // contentTypeWriter.SetTitle(fmt.Sprintf("\"%d\" Content Type Stats", status))

		// for contentType, total := range stat.contentTypes {
		// 	contentTypeWriter.AppendRow(table.Row{contentType, total})
		// }
		// statusTables[status] = append(statusTables[status], contentTypeWriter.Render())
	}

	fmt.Println(totalsWriter.Render())

	for _, status := range statuses {
		fmt.Println(statusTables[status])
	}
}

func init() {
	rootCmd.AddCommand(statsCmd)
	statsCmd.Flags().Bool("by-file", false, "Show totals for each file")
}
